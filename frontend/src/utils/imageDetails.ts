type ImageDetails = {
    faceDetails :  Record<string,any>
    failureReasons : string[]
    fileLocation   : string
    fileName       : string
    uploadTimestamp  : string
    validationResult : string
}

export type { ImageDetails }