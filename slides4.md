---
theme: ./theme
class: text-center
highlighter: shiki
lineNumbers: true
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
drawings:
  persist: false
title: Warsztat#5 - DevOps
layout: cover
altCover: cover-alt
clicks: 1
---

# Automatyzacja deploymentu

---

# Co będziemy robić
- stworzymy 2 VPSy (ansible, server)
- skonfigurujemy ssh pomiędzy maszynami
- skonfigurujemy dostęp do bitbucketa
- napiszemy i wykonamy playbook ansible który automatycznie skonfiguruje serwer i uruchomi usługę

---

# Ansible
<img border="rounded" width=800 src="/ansible7.png">

---

# Skonfiurujmy VPSy
## pierwszym serwerem może być nasz serwer z ostatnioch zajęć 
Jeżeli nie mamy jego klucza prywatnego tworzymy nową maszynę i dodajemy dostęp do bitbucketa
https://celebrated-cocada-fb0a7f.netlify.app/12 (do 27 slajdu)

---
layout: section
---

# Konfiguracja drugiego VPSa

---

<img border="rounded" width=500 src="/ansible5.png">

---

<img border="rounded" width=700 src="/ansible6.png">

---

# Logujemy się na serwer ansible

```bash
ssh ubuntu@52.172.3.43

The authenticity of host '52.172.3.43 (52.172.3.43)' can't be established.
ECDSA key fingerprint is SHA256:ZSPIL734dgYeXSU8hts1TKgyPBamwB6Q0nS+HofdW50.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes // ========== wpisujemy yes
Warning: Permanently added '52.172.3.43' (ECDSA) to the list of known hosts.

```

---

Logujemy się na nasz serwer z poprzednich zajęć/nowo stworzony i dodajemy klucze ssh które umożliwią nam komunikacje między naszymi serwerami w Azure (s1)

```bash
exit
scp ~/.ssh/ansible_key.pem ubuntu@52.172.3.43:~/.ssh/key.pem
// lub key.pem jeżeli używamy maszyny w poprzednich zajęć
scp ~/.ssh/key.pem ubuntu@52.172.3.43:~/.ssh/key.pem

ssh ubuntu@52.172.3.43
ls -la ~/.ssh/
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/key.pem
```

---

Z naszego serwera łączymy się do nowo stworzonego S1

```
ssh ubuntu@20.219.90.248 # ip serwera s1

The authenticity of host '52.172.3.43 (52.172.3.43)' can't be established.
ECDSA key fingerprint is SHA256:ZSPIL734dgYeXSU8hts1TKgyPBamwB6Q0nS+HofdW50.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes // {========== wpisujemy yes
Warning: Permanently added '52.172.3.43' (ECDSA) to the list of known hosts.
```

```bash
exit
sudo apt update
sudo apt install -y ansible
ansible --version

cd ~
git clone git@bitbucket.org:yoyo200100/webapp.git // tutaj wasze repo pobieramy
// jeżeli macie błąd dostępu tzn wracamy do poprzednich zajęć (https://celebrated-cocada-fb0a7f.netlify.app/23 - 27)
cd webapp
mkdir ansible
cd ansible
```


---

## Definiujemy inventory (jako ip dajemy adres publiczy serwera s1! )

```bash
nano inventory
```

```yaml
[azure]
20.219.90.248 // nie kopiujemy tutaj uzupełniamy adres serwera s1
```

```bash
nano install.yml
```

```yaml
---
- name: Install web servers
  hosts: "{{target}}" # ip s1
  user: ubuntu
  tasks:
    - name: Add nodejs 16 repository
      shell: "curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -"

    - name: Install nodejs packages
      become: yes
      apt:
        pkg:
          - nodejs
          - nginx
        update_cache: yes
        state: latest
```

---

# Sprawdzamy naszego playbook'a 
```bash
ansible-playbook -K -e "target=azure" -i inventory install.yml

BECOME password: // podajemy hasło do swojego roota na komputerze

PLAY [Install web servers] ***********************************************************************************************************************************************************************************

TASK [Gathering Facts] ***************************************************************************************************************************************************************************************
ok: [20.219.90.248]

TASK [Add nodejs 16 repository] ******************************************************************************************************************************************************************************
[WARNING]: Consider using the get_url or uri module rather than running 'curl'.  If you need to use command because get_url or uri is insufficient you can add 'warn: false' to this command task or set
'command_warnings=False' in ansible.cfg to get rid of this message.
changed: [20.219.90.248]

TASK [Install nodejs packages] *******************************************************************************************************************************************************************************
changed: [20.219.90.248]

PLAY RECAP ***************************************************************************************************************************************************************************************************
20.219.90.248              : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```


---

```bash
ssh ubuntu@20.219.90.248 # serwer s1
node -v 
nginx -v
exit
```


---

```bash
nano install.yml
```

```yaml

# ...
- name: Create directories
  file:
    path: "/var/www/webapp"
    state: directory
    owner: 'ubuntu'
    group: 'ubuntu'
  become: yes

- name: Clone project
  copy:
    dest: /var/www/
    src: ../../webapp
# ...

```

---

# Sprawdzamy działanie (na serwerze z ansible)
```bash
ansible-playbook -K -e "target=azure" -i inventory install.yml
```

```bash
PLAY RECAP ***************************************************************************************************************************************************************************************************
20.219.90.248              : ok=7    changed=4    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

---

## Konfiguracja nginxa
kopiujemy konfiguracje z poprzednich zajęć https://celebrated-cocada-fb0a7f.netlify.app/31

```bash
nano nginx.conf // w folderze ansible tworzymy plik nginx.conf

wklejamy konfig
CTRL-S CTRL-X
```

```bash
nano install.yml
```

```yaml
# ...
- name: Configure nginx
  copy:
    dest: /etc/nginx/nginx.conf
    src: nginx.conf
  become: yes

- name: Restart service nginx
  service:
    name: nginx
    state: restarted
  become: yes
```

---

## Konfigurujemy frontend
```bash
nano install.yml
```

```yaml
# ...
  - name: install dependencies front
    npm:
      ci: yes
      path: "/var/www/webapp/front"

  - name: Build front
    shell: "npm run build"
    args:
      chdir: "/var/www/webapp/front"
```
---

## Sprawdzamy czy serwer się prawidłowo buduje
```bash
ansible-playbook -K -e "target=azure" -i inventory install.yml
```

---

## Sprawdzamy w przeglądarce IP serwera s1
<img border="rounded" width=700 src="/nginx2.png">

---

# Zadanie domowe - ansible do backendu
Uruchomienie backendu przy pomocy ansible:
Kroki:
- instalacja globalnie pm2
- npm ci w /var/www/webapp
- pm2 start index.js 

---

# Projekt zaliczeniowy 
aplikacja umożliwiającą zestawienie połączenia telefonicznego (front, backend, ansible)

Kryteria oceny:
 - 3 - front + backend + instrukcja uruchomienia w readme
 - 4 - front + backend + instrukcja w readme + ansible (front + backend) 
 - 5 - front + backend + instrukcja w readme + ansible (front + backend) + “coś ekstra”

Projekt ma zostać wysłany w formie linku do repozytorium na adres:
przedmiot@focustelecom.pl 