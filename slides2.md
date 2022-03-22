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
  stopPolling(): void
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
  stopPolling() {
    clearInterval(this.interval)
  }
```
<style scoped>
.shiki-container {
  margin-top: -25px;
}
</style>


---

# Tworzymy widok Ringing

W katalogu views tworzymy plik Ringing.vue
src/views/ringing.Vue

```vue
<template>
  <div class="box">
    <div class="text">Zaraz nastąpi połączenie z konsultantem.</div>
  </div>
</template>

<script lang="ts">
import ViewManager from '../services/ViewManager'

export default {
  mounted(): void {
    ViewManager.checkStatus()
  },
}
</script>
```
---

# Tworzymy widok Failed

W katalogu views tworzymy plik Failed.vue
src/views/failed.Vue

```vue
<template>
  <div class="box">
    <div class="text">Nie udało się stworzyć połączenia</div>
  </div>
</template>

<script lang="ts">
import ViewManager from '../services/ViewManager'

export default {
  mounted(): void {
    ViewManager.stopPolling()
  },
}
</script>
```
---

# Tworzymy widok Answered

W katalogu views tworzymy plik Failed.vue
src/views/failed.Vue

```vue
<template>
  <div class="box">
    <div class="text">Dziękujemy za połączenie!</div>
    <button @click="return">Powrót do strony głównej</button>
  </div>
</template>

<script lang="ts">
import ViewManager from '../services/ViewManager'

export default {
  mounted(): void {
    ViewManager.stopPolling()
  },
  methods(): {
    return() {
      this.$router.push({ name: 'start' })
    }
  }
}
</script>
```

---

# Dzięki!
# część Michała