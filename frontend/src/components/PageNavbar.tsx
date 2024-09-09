import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function PageNavbar() {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" className='mb-5 py-3 px-5' data-bs-theme="dark">
        <a href='/'><h1 className='text-light me-4'>Student Photo Validator</h1></a>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav>
            <Nav.Link href="/"><h4 className='text-light mx-4'>Upload</h4></Nav.Link>
            <Nav.Link href="/all"><h4 className='text-light mx-4'>View All</h4></Nav.Link>
          </Nav>
        </Navbar.Collapse>
    </Navbar>
  );
}

export default PageNavbar