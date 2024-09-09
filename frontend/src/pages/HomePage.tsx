import Container from 'react-bootstrap/Container';
import {Button, Form, Card, Spinner} from 'react-bootstrap';
import defaultProfile from '../img/profile.jpg'
import { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function imageToBinary64( uploadPhotoFile : File | null) 
{
  if( uploadPhotoFile != null)
  {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadPhotoFile);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = () => {
        reject("");
      };
    });
  }
}


function HomePage() {
 
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadPhotoSrc, setUploadPhotoSrc] = useState<string>(defaultProfile)
  const [uploadPhotoFile, setUploadPhotoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)


  function fileSelectHandler(evt : React.ChangeEvent<HTMLInputElement>)
  {
    if(evt.target.files != null){     
       setUploadPhotoFile(evt.target.files[0])
       setUploadPhotoSrc( URL.createObjectURL(evt.target.files[0]) )
    }
  }

  function fileResetHandler()
  {
    setUploadPhotoFile(null)
    setUploadPhotoSrc(defaultProfile);
    if(fileInputRef.current){
      fileInputRef.current.value = ""
    }
  }

  async function fileUploadHandler()
  {
    if(uploadPhotoFile == null){return;}
    setIsLoading(() => true);

    try
    {
      let binaryImage  = await imageToBinary64(uploadPhotoFile) as string;
      binaryImage = binaryImage.split(",")[1]
      const res = await axios.post("https://zd4im0wh3a.execute-api.us-east-1.amazonaws.com/test/images/upload",
                                   binaryImage,
                                   {headers: { 'Content-Type': 'application/json'},params: {fileName: uploadPhotoFile.name}})
      
      setTimeout(()=>{
        navigate(`/details/${res.data}`);
      }, 2000)
    }
    catch(e){
      console.log(e)
    }
  }

  return (
    <Container className='justify-content-center align-items-center' style={{marginTop: '7vh' }}>
      <Card className='text-center p-3 mx-auto border border-dark border-4' style={{ maxWidth: '45vw' }}>
        <Card.Title><h1 className='mt-3'>Upload Student Photo</h1></Card.Title>
        <Card.Body className='mx-5'>
          <Card.Text className='text-start mb-5'>
          <h4>
            Ensure that your eyes are visable and mouth is closed.
            Only .jpg, .png, .jpeg files are supported
           </h4>
          </Card.Text>
          <Card style={{ maxWidth: '33rem'}} className='mx-auto border border-dark border-4 mb-3'>
            <Card.Img style={{height: '26rem'}} variant="top" src={uploadPhotoSrc}/> 
            <Form onSubmit={(e : React.FormEvent) => e.preventDefault()}>
             <Form.Control 
               type="file" 
               size="lg"  
               className='rounded-0' 
               style={{fontWeight: 700, borderTop: 'solid black', borderBottom: 'solid black'}} 
               onChange={fileSelectHandler} 
               ref={fileInputRef}
              />
             <div>
              {
                isLoading ?
                <Button variant="success"  className='border border-dark rounded-0' style={{ width: '100%'}} disabled>
                  <Spinner
                     as="span"
                     animation="border"      
                     role="status"
                     aria-hidden="true"
                     style={{ display: 'inline-block'}}
                     className='me-3'
                  />
                 <h3  style={{ display: 'inline-block'}}> Loading... </h3>
                </Button>      
                :
                <>
                <Button style={{ width: '50%'}} variant="danger" className='border border-dark rounded-0'  onClick={fileUploadHandler}><h4>Upload</h4></Button>   
                <Button style={{ width: '50%'}} variant="primary" className='border border-dark rounded-0' onClick={fileResetHandler}><h4>Reset</h4></Button> 
                </>              
              }                                 
             </div>                       
            </Form>   
          </Card>          
        </Card.Body>
      </Card>
    </Container>
  );
}

export default HomePage