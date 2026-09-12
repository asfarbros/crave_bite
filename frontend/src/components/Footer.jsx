import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white text-center py-6">
      <p>&copy; {new Date().getFullYear()} CraveBite. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
