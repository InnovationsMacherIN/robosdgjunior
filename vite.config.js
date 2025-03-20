import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgLoader from 'vite-svg-loader';
import basicSsl from '@vitejs/plugin-basic-ssl';


export default defineConfig({
  plugins: [
    react(),
    svgLoader({
      defaultImport: 'url'
    }),
    basicSsl()
  ],
  server: {
    https: true,
    host: true
  }
});
