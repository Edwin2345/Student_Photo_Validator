import { Button, Container, Table, Spinner} from "react-bootstrap";
import { useEffect, useState } from "react";
import { ImageSummary } from "../utils/imageSummary";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


function ShowPage() {
    const navigate = useNavigate()
    const [imageSummaryList, setImageSummaryList] =  useState<ImageSummary[]>([])
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)
  
    async function fetchImageSummaries(){
        try {
          const res = await axios.get("https://zd4im0wh3a.execute-api.us-east-1.amazonaws.com/test/images")
          const parsedRes : ImageSummary[] =  res.data.map( (image: any) => {
            return {
              uploadTimestamp: image.UploadTimestamp.slice(0,10),
              failureReasons: JSON.parse(image.FailureReasons),
              validationResult: image.ValidationResult,
              fileName: image.FileName
            }
          })
          console.log(parsedRes)
          setImageSummaryList(parsedRes)
  
        }catch(e){
          console.log(e)
        }
    }

    useEffect(() => {
      fetchImageSummaries()
    },[])


    async function deleteImageHandler(fileName: string){
      try {
        setIsDeleteLoading(() => true)
        await axios.delete("https://zd4im0wh3a.execute-api.us-east-1.amazonaws.com/test/images",{params:{"fileName": fileName}})
        setTimeout(()=>{
          window.location.reload();
        }, 1000)
      }catch(e){
        console.log(e)
      }
    }


    return (
      <>
        <Container className='justify-content-center align-items-center bg-light border border-dark border-4 p-5' style={{marginTop: '5vh', height: '80vh'}}>
        <h1 className="text-center mb-5">All Uploaded Images</h1>
        <Table size="sm"  striped bordered hover className="text-center border border-3 border-black">
           <thead>
              <tr>
                <th><h2>File Name</h2></th>
                <th><h2>Validation Result</h2></th>
                <th><h2>Failure Reasons</h2></th>
                <th><h2>Upload Date</h2></th>
                <th><h2>Actions</h2></th>
              </tr>
            </thead>
            <tbody>
               {
                imageSummaryList.map( (img, i) => {
                  return (
                    <tr key={i} style={{fontSize: '1.5rem'}}>
                      <td>{img.fileName}</td>
                      <td className={img.validationResult == "PASS" ? "text-success" : "text-danger"}>
                        <b>{img.validationResult}</b>
                      </td>
                      <td>
                        {img.failureReasons.length == 0 ? "N/A" : img.failureReasons.reduce( (prev, curr) => `${prev}, ${curr}`) }
                        </td>
                      <td>{img.uploadTimestamp.toString()}</td>
                      {
                        isDeleteLoading ?
                        (
                          <td>
                          <Button variant="success"  className='border border-dark rounded-0' style={{ width: '100%'}} disabled>
                          <Spinner
                            as="span"
                            animation="border"      
                            role="status"
                            aria-hidden="true"
                            style={{ display: 'inline-block'}}
                            className='me-3'
                          />
                          <h4  style={{ display: 'inline-block'}}> Loading... </h4>
                          </Button>
                          </td>
                        )
                        : (
                          <td>
                          <Button 
                          variant="primary"  
                          className='border border-dark rounded-0 me-3'
                          onClick={() => navigate(`/details/${img.fileName}`)}
                          >
                          <b>View</b>
                          </Button>
                          <Button 
                          variant="danger" 
                          className='border border-dark rounded-0'
                          onClick={() => deleteImageHandler(img.fileName)}
                          ><b>Delete</b>
                          </Button>
                        </td>
                        )
                      }
                    </tr>
                  )
                })
               }
            </tbody>
        </Table>
        </Container>
      </>
    )
}

export default ShowPage