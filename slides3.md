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

# Deploy na produkcje naszej aplikacji

---

# Co będziemy potrzebować
- przygotowaną aplikacje - dodanie konfiguracji
- VPS
- git z dostepem ssh / publiczne repo @ do ustalenia z Łukim
- nginx (reverse proxy i serwer plików statycznych)
- pm2 (do uruchomienia backendu)
- nodejs

---

# Przygotujmy konfiguracje naszej aplikacji
w głównym katalogu tworzymy plik konfiguracyjny config.js

```js
module.exports = {
    dialer: {
        url: 'https://uni-call.fcc-online.pl',
        login: '<login>',
        password: '<haslo>'
    }
}
```

---

```js
module.exports = {
    dialer: {
        url: 'https://uni-call.fcc-online.pl',
        login: '<login>',
        password: '<haslo>'
    },
    agent_number: '',
    api: {
        prefix: '/api',
        url: '',
    },
    front: {
        url: ''
    }
}
```

---

## Teraz podmieniamy opcje w kodzie:
webapp/app.js lub index.js

```js
const config = require('./config');
//...
Dialer.configure(config.dialer);
//...
// const io = new Server(server)
const io = new Server(server, {
   path: config.api.prefix + '/socket'
}) 
//...
app.post(config.api.prefix + '/call', async (req, res) => {
   const body = req.body;
   const number1 = body.number;
   // const number2 = '123123123';
   const number2 = config.agent_number;
```


---

`webapp/front/tsconfig.json`

```js
//...
"allowJs": true,
//...
```

`webapp/front/src/services/ViewManager.ts`

```js
// eslint-disable-next-line
import * as config from '../../../config'
//...
this.socket = io(config.api.url, {
    reconnection: false,
    transports: ["websocket", "polling"],
    path: config.api.prefix + '/socket'
});
```


---

`webapp/front/src/view/StartView.vue`

```html
//...
<script>
// eslint-disable-next-line
import * as config from '../../../config'
//...
    async call() {
      const responseStream = await fetch( `${config.api.url}${config.api.prefix}/call`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ number: this.number }),
      })
      const response = await responseStream.json()
      this.$router.push({ name: 'ringing', params: { callsId: response.id } })
    },
//...
```


---

# Wszystko działa? 
## to pushujemy zmiany na Bitbucketa
```bash
git add .
git commit -m "Dodanie konfiguracji usługi"
git push
```

---

<img border="rounded" src="/bb1.png">

---

<img border="rounded" src="/bb2.png">

---

# Najpierw zacznijmy od VPSa
https://portal.azure.com/#home

---

<img border="rounded" src="/azure1.png">

---

<img border="rounded" src="/azure2.png">

---

<img border="rounded" width=550 src="/azure3.png">

---

<img border="rounded" width=500 src="/azure4.png">

---

<img border="rounded" width=600 src="/azure5.png">

---

<img border="rounded" width=800 src="/azure6.png">

---

# Pobrany klucz ssh kopiujemy do ~/.ssh/

```bash
cp ./ssh.pem ~/.ssh/
chmod 600 ~/.ssh/ssh.pem
```

---

<img border="rounded" src="/azure7.png">

---

<img border="rounded" src="/azure8.png">

---

# Logujemy się na server

```bash
ssh-add ~/.ssh/ssh.pem
ssh ubuntu@52.172.3.43

The authenticity of host '52.172.3.43 (52.172.3.43)' can't be established.
ECDSA key fingerprint is SHA256:ZSPIL734dgYeXSU8hts1TKgyPBamwB6Q0nS+HofdW50.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes // {========== wpisujemy yes
Warning: Permanently added '52.172.3.43' (ECDSA) to the list of known hosts.
```

---

```bash
Welcome to Ubuntu 20.04.4 LTS (GNU/Linux 5.13.0-1017-azure x86_64)
 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage
  System information as of Mon Mar 28 11:45:29 UTC 2022
  System load:  0.21              Processes:             109
  Usage of /:   4.8% of 28.90GB   Users logged in:       0
  Memory usage: 26%               IPv4 address for eth0: 10.2.0.4
  Swap usage:   0%
1 update can be applied immediately.
To see these additional updates run: apt list --upgradable
The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.
Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

azureuser@service:~$
```

---

```bash
ssh-keygen -t ed25519 -C "<twoj@email>"

Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/azureuser/.ssh/id_ed25519):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/azureuser/.ssh/id_ed25519
Your public key has been saved in /home/azureuser/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:MFYPcHYYC9X/sWKrZ2QRp3TLD74D/u8k7Q6xmiaVqww yoyo20010096@gmail.com
The key's randomart image is:
+--[ED25519 256]--+
|      ooB+.      |
|       =.=. o o  |
|      + . .o * . |
|     . o    + =  |
|        S    =.= |
|            O ++.|
|        E  * =+.o|
|         o. Boo= |
|          +Bo..==|
+----[SHA256]-----+
```

---

# Dodajemy dos†ęp do Bitbucketa
## https://bitbucket.org/dashboard/overview

<img border="rounded" width=800 src="/azure9.png">

---

<img border="rounded" src="/azure10.png">

---

# Kopiujemy klucz ssh do Bitbucketa
```bash
cat ~/.ssh/id_ed25519.pub

ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAVbuM29ZFFPvqqRurKK9S3Xm/HYuK3L7bxoxTIblnQF yoyo20010096@gmail.com
```
<img border="rounded" width=500 src="/azure11.png">

---

<img border="rounded" src="/azure12.png">

---

```bash
mkdir /var/www
cd /var/www
sudo chown -R ubuntu:ubuntu /var/www/
git clone git@bitbucket.org:yoyo200100/webapp.git

Cloning into 'examplerepo'...
The authenticity of host 'bitbucket.org (104.192.141.1)' can't be established.
RSA key fingerprint is SHA256:zzXQOXSRBEiUtuE8AikJYKwbHaxvSc0ojez9YXaGp1A.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes  #============= wpisujemy yes
Warning: Permanently added 'bitbucket.org,104.192.141.1' (RSA) to the list of known hosts.
remote: Enumerating objects: 4, done.
remote: Counting objects: 100% (4/4), done.
remote: Compressing objects: 100% (4/4), done.
remote: Total 4 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (4/4), done.

azureuser@service:~$
```


---

# Mamy maszynę mamy dostęp do gita - co teraz?
### Teraz musimy zainstalować wymagane paczki

```bash
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt-get update
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2
node -v
pm2 -v
nginx -v
```

---

# Nginx

<img border="rounded" width=700 src="/nginx.png">

---

## Modyfikujemy konfiguracje nginx'a:

```bash
sudo nano -n /etc/nginx/nginx.conf
```

## Szybkie podstawy nano:
```bash
CTRL + V // wklejamy konfiguracje

CTRL + X // zapisz
Y // potwierdź
ENTER // jeszcze raz potwierdź

```

<CopyStyles>  Kliknij aby pobrać konfiguracje nginx </CopyStyles>

---

```bash
sudo systemctl restart nginx
sudo systemctl status nginx

● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2022-03-28 12:14:21 UTC; 21min ago
       Docs: man:nginx(8)
   Main PID: 3320 (nginx)
      Tasks: 2 (limit: 1081)
     Memory: 4.4M
     CGroup: /system.slice/nginx.service
             ├─3320 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
             └─3321 nginx: worker process

Mar 28 12:14:21 service systemd[1]: Starting A high performance web server and a reverse proxy server...
Mar 28 12:14:21 service systemd[1]: Started A high performance web server and a reverse proxy server.

```

---

# Konfigurujemy dane dostępowe do api
```bash
nano /var/www/webapp/config.js
```

```js
module.exports = {
    dialer: {
        url: 'https://uni-call.fcc-online.pl',
        login: '<login>', // to uzupełniamy
        password: '<haslo>' // to uzupełniamy
    },
    agent_number: '', // to uzupełniamy
    api: {
        prefix: '/api',
        url: '',
    },
    front: {
        url: ''
    }
}
```

---

```bash
cd /var/www/webapp/front
npm ci
npm run build
```
<img border="rounded" width=600 src="/nginx2.png">

---

```bash
cd /var/www/webapp
npm ci
pm2 start app.js # lub index.js, wasz plik serwera

# powinniśmy zobaczyć w konsoli:

ubuntu@server:/var/www/webapp$ pm2 start app.js
[PM2] Starting /var/www/webapp/app.js in fork_mode (1 instance)
[PM2] Done.
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ app                │ fork     │ 0    │ online    │ 0%       │ 51.8mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘

pm2 status
```

<img border="rounded" src="/pm21.png">


---

```bash
pm2 monit
# wyjście
CTRL + C
```

<img border="rounded" width=650 src="/pm22.png">

---
layout: section
---
# Sprawdzamy działanie!

---

<img border="rounded" src="/azure8.png">
