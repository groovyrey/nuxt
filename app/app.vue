<template>
  <div class="container">
    <header>
      <h1>Face Recognition Test</h1>
      <p>Using @vladmandic/face-api in Nuxt</p>
    </header>
    
    <main>
      <ClientOnly>
        <FaceDetector />
        <template #fallback>
          <div class="loading">Loading Client Side...</div>
        </template>
      </ClientOnly>
    </main>

    <footer>
      <p>Ensure camera permissions are granted.</p>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #1a1a1a;
  color: #fff;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

header {
  margin-bottom: 2rem;
}

h1 {
  margin: 0;
  color: #42b883;
}

main {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.loading {
  padding: 2rem;
  font-style: italic;
  color: #888;
}

footer {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #666;
}
</style>
