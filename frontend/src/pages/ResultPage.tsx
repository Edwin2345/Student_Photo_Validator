import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { ImageDetails } from "../utils/imageDetails";
import { Container, Card, Table} from "react-bootstrap";
import { validationCategories } from "../utils/validationCategories";

function ResultPage() {
    const {fileName} = useParams();
    const [imageDetails, setImageDetails] =  useState<ImageDetails>();

    async function fetchImageDetails()
    {
      try
      {
        const res = await axios.get(
          "https://zd4im0wh3a.execute-api.us-east-1.amazonaws.com/test/images",
          {params: {"imageName": fileName}}
          )
        
        let faceDetailParsed : Record<string,any> = {};
        const faceDetailRaw = JSON.parse(res.data.FaceDetails)
        for (const [key, value] of Object.entries(faceDetailRaw)) {
          faceDetailParsed[key] = value;
        }


        //Set Image Details State
        const imgDet : ImageDetails =  {
          faceDetails: faceDetailParsed,
          failureReasons: JSON.parse(res.data.FailureReasons),
          fileLocation: res.data.FileLocation,
          fileName: res.data.FileName,
          validationResult: res.data.ValidationResult,
          uploadTimestamp: res.data.UploadTimestamp.toString()
        }
    
        setImageDetails(imgDet)

      }catch(e){
        console.log(e)
      }
    }
   
    useEffect(() => {
      //Fetch data for image result
      fetchImageDetails()
    }, [])
     
    return (
      <>
      <Container className='justify-content-center align-items-center bg-light border border-dark border-4 p-5' style={{marginTop: '5vh' }}>
        <h1 className="text-center">Result for {fileName}: <span className={imageDetails?.validationResult == "PASS" ? 'text-success' : 'text-danger'}>{imageDetails?.validationResult}</span></h1>
        { imageDetails?.failureReasons.length &&
          <h3 className="text-center mt-3">Reasons: {imageDetails?.failureReasons.reduce( (prev, curr) => `${prev}, ${curr}`)} </h3>}
        <Card style={{ maxWidth: '40rem'}} className='mx-auto border border-dark border-4 my-4'>
            <Card.Img style={{height: '30rem'}} variant="top" src={imageDetails?.fileLocation}/>
        </Card>
        <Table size="sm"  striped bordered hover className="text-center border border-3 border-black mt-5">
              <thead>
                <tr>
                  {
                    validationCategories.map((cat, i)=>{
                       return (
                        <th key={i}><h2>{cat.replace(/([A-Z])/g, ' $1')}</h2></th>
                       )
                    })
                  }
                </tr>
              </thead>
              <tbody>
                <tr>
                  {
                    validationCategories.map((cat,i)=>{
                       return (
                        <td key={i}><b style={{fontSize: '1.5rem'}}>
                        <span className={imageDetails?.faceDetails[cat].Value ? "text-success" : "text-danger"}>
                          {imageDetails?.faceDetails[cat].Value ? "TRUE " : "FALSE "}
                        </span>
                        - {imageDetails?.faceDetails[cat].Confidence.toFixed(2)}%
                        Conf.
                        </b></td>
                       )
                    })
                  }
                </tr>
              </tbody>
            </Table>
      </Container>
      </>
    )
}

export default ResultPage