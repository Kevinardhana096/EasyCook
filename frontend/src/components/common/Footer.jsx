import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaHeart,
  FaUser
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-orange-50 text-orange-800 text-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Logo & Description */}
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-orange-700 to-red-900 bg-clip-text text-transparent">
              CookEasy
            </h3>
            <p className="mt-1 text-orange-700 text-xs font-serif">
              Simple & delicious recipes made easy.
            </p>
          </div>

          {/* Contact Info */}
          <div className="md:ml-auto text-right mr-2">
            <h4 className="font-brand font-medium mb-2">Contact</h4>
            <ul className="space-y-1 text-xs font-brand">
              <li className="flex items-center justify-end">
                <FaUser className="ml-2 text-orange-600" />
                <a className="hover:underline ml-2 text-xs">
                  Kevin Ardhana, Nancy Jiwono, Chandra Junardi
                </a>
              </li>
              <li className="flex items-center justify-end">
                <FaEnvelope className="ml-2 text-orange-600" />
                <a href="tel:+1234567890" className="hover:underline ml-2">
                  dana@gmail.com, nancyjiwono@gmail.com, cacan@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-orange-200 mt-4 pt-3 text-center text-xs text-orange-600 font-brand">
          <p className="flex justify-center items-center gap-1">
            &copy; {currentYear} CookEasy. All rights reserved.{" "}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;