import {Routes, Route} from "react-router-dom"
import HomePage from "./pages/HomePage"
import TablePage from "./pages/ShowPage"
import { BrowserRouter } from "react-router-dom";
import PageNavbar from "./components/PageNavbar"
import ResultPage from "./pages/ResultPage";

function App() {
  return (
    <>
    <BrowserRouter>
      <PageNavbar/>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/details/:fileName" element={<ResultPage/>} />
        <Route path="/all" element={<TablePage/>} />
      </Routes>
    </BrowserRouter>    
    </>
  )
}

export default App
