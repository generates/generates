<template>
  <div>
    <input v-model="name">
    <div>Hello {{ name }}!</div>
  </div>
</template>

<script>
  export default {
    data: () => ({ name: 'World' })
  }
</script>
