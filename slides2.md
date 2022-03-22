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

# Problemy z npm run serve
edytujemy vue.config.js

```vue {all|8-9|all}
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    historyApiFallback: true,
    allowedHosts: "all",
    host: 'localhost',
    port: 8080,
  },
});
```


---
layout: section
---
# Zarządzanie widokami

---

# Tworzymy serwis zarządzający widokami

W katalogu src tworzymy katalog services a w nim plik ViewManager.ts

```ts
import router from '../router'

interface IViewManager {
  changeView(): void
  checkStatus(): void
  stopCheckingStatus(): void
}
type SetIntervalType = ReturnType<typeof setInterval>

class ViewManager implements IViewManager {
  private interval: undefined | SetIntervalType
  private status = ''
}

export default new ViewManager()

```

---
title: Dodajemy brakujące metody
---

```ts
  changeView() {
    switch (this.status) {
      case 'CONNECTED':
        router.push({ name: 'connected' })
        break
      case 'FAILED':
        router.push({ name: 'failed' })
        break
      case 'ANSWERED':
        router.push({ name: 'answered' })
    }
  }
  checkStatus() {
    this.interval = setInterval(async () => {
      const responseStream = await fetch(`http://localhost:3000/status`, { method: 'GET', })
      const response = await responseStream.json()
      if (response.status !== this.status) {
        this.status = response.status
        this.changeView()
      }
      this.status = response.status
    }, 500)
  }
  stopCheckingStatus() {
    clearInterval(this.interval)
  }
```
<style scoped>
.shiki-container {
  margin-top: -25px;
}
</style>


---

# Tworzymy widok RingingView.vue
```vue
<template>
  <div class="box">
    <div class="text">Zaraz nastąpi połączenie z konsultantem.</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewManager from '../services/ViewManager'

export default defineComponent({
  name: 'RingingView',
  mounted(): void {
    ViewManager.checkStatus()
  },
})
</script>
```
---

# Tworzymy widok FailedView.vue
```vue
<template>
  <div class="box">
    <div class="text">Nie udało się stworzyć połączenia</div>
     <button @click="backToStart"> Powrót do strony głównej </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewManager from '../services/ViewManager'

export default defineComponent({
  name: 'startView',
  mounted(): void {
    ViewManager.stopCheckingStatus()
  },
  methods: {
    backToStart(): void {
      this.$router.push({ name: 'start' })
    }
  }
})
</script>
```

---

# Tworzymy widok ConnectedView.vue
```vue
<template>
  <div class="box">
    <div class="text">Trwa połączenie z konsultantem.</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ConnectedView',
})
</script>
```

---

# Tworzymy widok AnsweredView.vue
```vue
<template>
  <div class="box">
    <div class="text">Dziękujemy za połączenie!</div>
    <button @click="backToStart"> Powrót do strony głównej </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewManager from '../services/ViewManager'

export default defineComponent({
  name: 'startView',
  mounted(): void {
    ViewManager.stopCheckingStatus()
  },
  methods: {
    backToStart(): void {
      this.$router.push({ name: 'start' })
    }
  }
})
</script>
```

---

# Rejestrujemy ścieżki w routerze

```ts
import Connected from '../views/ConnectedView.vue'
import Failed from '../views/FailedView.vue'
import Answered from '../views/AnsweredView.vue'

const routes: Array<RouteRecordRaw> = [
  ..., // tutaj routes z poprzednich zajęć
  {
    path: '/',
    name: 'failed',
    component: Failed,
  },
  {
    path: '/',
    name: 'connected',
    component: Connected,
  },
  {
    path: '/',
    name: 'answered',
    component: Answered,
  },
]
```

---
layout: section
title: socket.io
---

# Przechodzimy na sockety!

---

# Instalujemy socket.io

Instalujemy socket.io w wersji serwerowej w naszym backendzie 

```bash
npm install socket.io
```


Instalujemy socket.io w wersji klienckiej w naszym froncie 

```bash
cd front
npm install socket.io-client
```

---

# Obsługa socketów po stronie serwera

```js
const { Server } = require('socket.io'); // importujemy serwer socket.io
// ...

const server = app.listen(3000, () => { // przypisujemy instancje serwera express do zmiennej 
   console.log('app listening on port 3000');
});

// ...
const io = new Server(server) // tworzymy instancje socket.io

io.on("connection", (socket) => { // nasłuchujemy na rozpoczęcie połączenia
  console.log('Połączono socket');
  io.emit("status", 5555);
});

```

---

# Obsługa socketów po stronie klienta

w main.ts

```ts
import io from 'socket.io-client';
const socket = io('https://3000-<url workspace>/', {
    reconnection: false,
    transports: ["websocket", "polling"]
});

```

---
layout: section
---

# Testujemy sockety

---

# Dostosowujemy nasz backend by status był przesyłany socketem

```js {7-18|all}
app.post('/call/', async (req, res) => {
   const body = req.body;
   const number1 = body.number;
   const number2 = '<Numer>';
   console.log('dzwonie', number1, number2)
   bridge = await Dialer.call(number1, number2);
   
   let oldStatus = null
   let interval = setInterval(async () => {
      let currentStatus = await bridge.getStatus();
      if (currentStatus !== oldStatus) {
         oldStatus = currentStatus
         io.emit('status', currentStatus)
      }
      if (currentStatus === 'ANSWERED') {
         clearInterval(interval)
      }
   }, 1000)

   res.json({ success: true });
})
```

---

# Wprowadzamy zmiany w ViewManager.ts

```ts
import io from 'socket.io-client'
// ...
type SocketIoType = ReturnType<typeof io> // definiujemy typ dla socketu
// ...
class ViewManager implements IViewManager {
  private status = ''
  private socket: undefined | SocketIoType

  changeView() {...}} // nic nie zmieniamy w metodzie changeView
  checkStatus() {
    this.socket = io('https://3000-<url workspace>.gitpod.io/', {
        reconnection: false,
        transports: ["websocket", "polling"]
    });
    this.socket.on('status', (status) => {
        console.log(status)
        this.status = status
        this.changeView()
    })
  }
  stopCheckingStatus() {
    this.socket?.close()
  }
}
```

---

# Praca domowa

Zarejestrować się uczelnianym mailem na:
https://azure.microsoft.com/pl-pl/free/students/
<img border="rounded" height=500 width=800   src="/azure.png">
