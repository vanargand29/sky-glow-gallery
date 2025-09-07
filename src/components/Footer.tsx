import { MessageCircle, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Tentang Kami */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Tentang Kami</h4>
            <p className="text-gray-400 transition-colors duration-300">
              Kami hadir untuk menemani setiap langkah perjalananmu di dunia Sky: Children of the Light. Melalui J Store, kamu bisa menemukan berbagai item eksklusif, bundle menarik, hingga season pass, dengan pelayanan ramah dan terpercaya.
            </p>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Layanan</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Roblox
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Genshin Impact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Mobile Legends
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Sky: Children of the Light
                </a>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                WhatsApp: <a 
                  href="https://wa.me/6289504041209" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline transition-colors duration-300"
                >
                  J Store
                </a>
              </li>
              <li>
                Tiktok: <a 
                  href="https://www.tiktok.com/@j_storeskycotl" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline transition-colors duration-300"
                >
                  J Store
                </a>
              </li>
              <li>Address: Jawa Timur, Indonesia</li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {/* WhatsApp */}
              <a 
                href="https://chat.whatsapp.com/IA8EksqKDVRHpp2a4gYVfQ" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </a>

              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@j_storeskycotl" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors duration-300"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.10z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/j_storeskycotl/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors duration-300"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 transition-colors duration-300">
          <p>© 2025 J Store. Terima kasih sudah menjadi bagian dari perjalanan kami di langit ✨</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
