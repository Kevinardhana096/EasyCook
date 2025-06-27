import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import RoleTestingPanel from '../common/RoleTestingPanel';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <RoleTestingPanel />
    </div>
  );
};

export default Layout;