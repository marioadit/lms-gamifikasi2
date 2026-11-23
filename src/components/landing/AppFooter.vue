<script setup></script>

<template>
  <!-- Footer -->
  <footer class="bg-neutral text-neutral-content">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <!-- Footer Logo with CSS filter -->
          <div class="flex items-center space-x-2 mb-4">
            <img src="../../assets/images/sm.png" alt="Logo" class="w-8 h-8 brightness-0 invert" />
            <span class="text-lg font-bold">Sinau Matika</span>
          </div>
          <p class="text-sm opacity-80">
            Menjadikan pendidikan menyenangkan dan menarik melalui gamifikasi
            dan konten interaktif.
          </p>
        </div>

        <div>
          <h3 class="footer-title">Tautan Cepat</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="hover:underline">Beranda</router-link>
            </li>
            <li>
              <router-link to="/tentangkami" class="hover:underline">Tentang Kami</router-link>
            </li>
            <li>
              <router-link to="/layanan" class="hover:underline">Layanan</router-link>
            </li>
            <!-- <li><router-link to="/kontak" class="hover:underline">Kontak</router-link></li> -->
          </ul>
        </div>

        <div>
          <h3 class="footer-title">Legal</h3>
          <ul class="space-y-2">
            <li>Syarat Layanan</li>
            <li>Kebijakan Privasi</li>
          </ul>
        </div>

        <div>
          <h3 class="footer-title">Hubungi Kami</h3>
          <ul class="space-y-2">
            <li class="flex items-center">
              <span class="mr-2">📧</span>
              <span>humas@staff.ukdw.ac.id</span>
            </li>
            <li class="flex items-center">
              <span class="mr-2">📱</span>
              <span>+62 274 563 929</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-neutral-focus mt-8 pt-8 text-center text-sm opacity-80">
        <p>© 2025 Sinaumatika. Hak Cipta Dilindungi.</p>
      </div>
    </div>
  </footer>
</template>
