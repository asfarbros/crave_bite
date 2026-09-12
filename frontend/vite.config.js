import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        activateEmail: resolve(__dirname, 'activate-email.html'),
        booking: resolve(__dirname, 'booking.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        emailService: resolve(__dirname, 'email-service.html'),
        emailSetup: resolve(__dirname, 'email-setup.html'),
        emailTemplate: resolve(__dirname, 'email-template.html'),
        eventEmailTemplate: resolve(__dirname, 'event-email-template.html'),
        events: resolve(__dirname, 'events.html'),
        login: resolve(__dirname, 'login.html'),
        menu: resolve(__dirname, 'menu.html'),
        myorders: resolve(__dirname, 'myorders.html'),
        signup: resolve(__dirname, 'signup.html'),
        success: resolve(__dirname, 'success.html')
      }
    }
  }
})
