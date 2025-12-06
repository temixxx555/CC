import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";

const manifestForPlugIn = {
  registerType:'autoUpdate',
  includeAssets:['favicon.ico', "apple-touch-icon.png", "masked-icon.svg"],
  manifest:{
    name:"Campus Connect",
    short_name:"Campus connect",
    description:"connecting with peers around campus",
    icons:[
      {
        src: '/android-chrome-192x192.png',
        sizes:'192x192',
        type:'image/png',
        purpose:'any'
      },
      {
        src:'/android-chrome-512x512.png',
        sizes:'512x512',
        type:'image/png',
        purpose:'any'
      },
      {
        src: '/apple-touch-icon.png',
        sizes:'180x180',
        type:'image/png',
        purpose:'any',
      },
      {
        src: '/maskable_icon.png',
        sizes:'512x512',
        type:'image/png',
        purpose:'any maskable',
      }
    ],
    theme_color:'#000000',
    background_color:'#ffffff',
    display:"standalone",
    scope:'/',
    start_url:"/",
    orientation:'portrait'
  }
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      ...manifestForPlugIn,
      workbox: {
        // 🔥 Increase the default 2MB limit so the build won’t fail
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }
    })
  ]
})
