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
title: Warsztat#3 - Vue.js
layout: cover
altCover: cover-alt
clicks: 1
---

# Vue.js

---

# Przydatne rozszerzenia do Visual Studio Code

Volar

<img border="rounded"  src="/volar.png">

---
layout: section
title: Instalacja
---
# Instalacja i uruchomienie aplikacji 

---

# Pierwsze uruchomienie aplikacji

Instalujemy vue-cli
```bash
npm install -g @vue/cli
```
Tworzymy defaulotwy projekt
```bash
vue create front
```

<img border="rounded" height=500 width=800 src="/vue-create.png">

---

# Pierwsze uruchomienie aplikacji - 2

Jeśli mamy problem z uprawnieniami (windows)
```bash
vue.cmd create front
```

Przechodzimy do katalogu
```bash
cd front
```

---

# Pierwsze uruchomienie aplikacji - 3

Edytujemy vue.config.js
```vue {all|5-8|all}
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    historyApiFallback: true,
    allowedHosts: "all",
  },
});
```

Uruchamiamy aplikacje w trybie developerskim

```bash
npm run serve
```
---

# Struktura katalogów

<img border="rounded" height=500 width=400 src="/structure.png">

---
layout: sfc
example: Multiple
---

# Data binding & event-emiting

---

# Dodajemy routing do aplikacji

```shell 
vue add router
```

---
title: Home i About
---

<div grid="~ cols-2 gap-4">
<div>

Sprawdźmy jak wyglądają nasze dwa widoki

HomeView.vue

```vue {all|1-6|8-19|10,14-16|all}
<template>
    <div class="home">
      <img alt="Vue logo" src="../assets/logo.png" />
      <HelloWorld msg="Welcome to Your Vue.js App" />
    </div>
</template>

<script lang="ts">
  // @ is an alias to /src
  import HelloWorld from '@/components/HelloWorld.vue'

  export default {
    name: 'Home',
    components: {
      HelloWorld,
    },
  }
</script>
```
</div>
<div>

<p> </p>

AboutView.vue

```vue
<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>
```

</div>
</div>

---
title: Router.ts
---

```ts {all|5-8,9-18|8|16,17|all}
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
```

<style scoped>
.shiki-container {
  margin-top: -15px;
}
</style>

---

# Tworzymy widok startView

```vue
<template>
  <p>start</p>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data: () => ({
    number: '',
  }),
  methods: {
    async call() {
      await fetch('http://3000-<adres naszego workspace>/call', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ number: this.number }),
      })
    },
  },
})
</script>
```
---

# Dodajemy nową ścieżkę do routingu
src/router/index.ts
```ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Start from '../views/StartView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'start',
    component: Start,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
```

---

# Edytujemy App.vue
src/views/App.vue
```vue
<template>
  <div class="window">
    <router-view />
  </div>
</template>

<style>
/* Tu wklej style
Dostępne w plikach na teams lub pod przyciskiem poniżej
*/
</style>
```

<copyStyles>Klik</CopyStyles>

---

# Widok start

<img src="/start.png" />

---


# Dodajemy template do StartView.vue
src/views/StartView.vue

```vue
<template>
  <div>
    <div class="header clearfix">Zadzwonimy do Ciebie w ciągu 26 sekund.</div>
    <label class="form-label clearfix" for="form-number">
      Wprowadź numer
    </label>
    <input v-model="number" class="form-number clearfix" id="form-number" />
    <div class="call-button" @click="call()">Zadzwoń teraz</div>
  </div>
</template>
```

---

# Ustawiamy numer na backendzie

``` js
app.post('/call/', async (req, res) => {
   const body = req.body;
   const number1 = body.number;
   const number2 = '<twój numer>';
   bridge = await Dialer.call(number1, number2);
   res.json({ success: true });
  })
```

---
layout: section
---

# Sprawdźmy działanie!

---

# Podaj numer i wykonaj połączenie
<img src="/start2.png" />

---


# Znane problemy

- Nie uruchomiony backend - node app.js w katalogu z backendem 
- Nie podane dane autoryzacyjne w app.js na backendzie
- Serwer odpalony na innym porcie
- W logach backendu mam Ringing-Connected-Answered a telefon nie dzwoni - backend działa w trybie mock
- Błąd że cannot find id - numeru nie ma w naszej bazie - zgłoś problem prowadzącemu
- Miałeś inny problem? Daj znać i dopiszemy go do listy!

---

# Tworzymy nowy widok RingingView
src/views/RingingView.vue

```vue
<template>
  <div class="box">
    <div class="text">Zaraz nastąpi połączenie z konsultantem.</div>
  </div>
</template>
```

---

# Dodajemy nową ścieżkę do routingu
src/router/index.ts
```ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Start from '../views/StartView.vue'
import Ringing from '../views/RingingView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'start',
    component: Start,
  },
  {
    path: '/',
    name: 'ringing',
    component: Ringing,
  },
]

const router = createRouter({...})

export default router
```

---

# Rozszerzamy widok Start

```vue {all|10,17-18|all}
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data: () => ({
    number: '',
  }),
  methods: {
    async call() {
      const responseStream = await fetch('https://localhost:3000/call', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ number: this.number }),
      })
      const response = await responseStream.json()
      this.$router.push({ name: 'ringing', params: { callsId: response.id } })
    },
  },
})
</script>
```

---

# Co dalej?

- Pobieranie statusu oraz zmiana widoków (pooling/socket.io)
- Obsługa błędów - niepowodzenie w trakcie nawiązywania połączenia


---

# Sprawdź też


- https://education.github.com/pack
- https://frontendmasters.com/learn/vue/
- https://www.vuemastery.com/courses
- https://router.vuejs.org/
