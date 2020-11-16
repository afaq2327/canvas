import React, { useState,useEffect } from "react";
import { Document, Page,canvas } from "react-pdf";
import Rect from './rect'
export default function SinglePage(props) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); //setting 1 to show fisrt page
  //canvas vars
  const[width,setWidth] = useState(320)
  const[height,setHeight] = useState(200)
  const[strokeStyle,setStrokeStyle] = useState('#F00')
  const[lineWidth,setLineWidth] = useState(1)
  const[ctx,setCtx] = useState(null)
  const[isDirty,setIsDirty] = useState(false)
  const[isDrag,setIsDrag] = useState(false)
  const[startX,setStartX] = useState(10)
  const[startY,setStartY] = useState(10)
  const[curX,setCurX] = useState(20)
  const[curY,setCurY] = useState(20)
  const [canv,setCanv] = useState(null)

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);

  }

  function handleRender(data){
    console.log(data)
    const page = document.getElementsByClassName('pdf_page')[0]
    if(page){
      let canvas = document.getElementsByClassName('react-pdf__Page__canvas')[0]
      console.log(canvas)
      if(canvas){
        setCanv(canvas)
        let tempCtx = canvas.getContext('2d')
        tempCtx.strokeStyle = strokeStyle
        tempCtx.lineWidth = lineWidth
        setCtx(tempCtx)
        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mousemove', onMouseMove, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
      } 
    }
  }

  const onMouseDown = (e) => {
    setIsDrag(true)
    setCurX(e.offsetX)
    setStartX(e.offsetX)
    setCurY(e.offsetY)
    setStartY(e.offsetY)
    requestAnimationFrame(updateCanvas)
  };

  const onMouseUp = (e) => {

    setIsDrag(false)
    setIsDirty(true)
    console.log(curX,curY,startX,startY)
    const rect = {
      x: Math.min(startX, curX),
      y: Math.min(startY, curY),
      w: Math.abs(e.offsetX - startX),
      h: Math.abs(e.offsetY - startY),
    }
    console.log(rect)
  };

  const onMouseMove = (e) => {
    if (! isDrag) return
    setCurX(e.offsetX)
    setCurY(e.offsetY)
    setIsDirty(true)
  };

  function updateCanvas(){
      if (isDrag) {
        requestAnimationFrame(updateCanvas)
      }
      if (!isDirty) {
        return
      }
      
      ctx.clearRect(0, 0, width, height)
      if (isDrag) {      
        const rect = {
          x: startX,
          y:  startY,
          w:  curX -  startX,
          h:  curY -  startY,
        }

        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)  
      }  
      setIsDirty(false)
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const { pdf } = props;

  return (
    <>
      
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
        </p>
        <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
          Previous
        </button>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          Next
        </button>
      </div>
      <Document
        file={pdf}
        options={{ workerSrc: "/pdf.worker.js" }}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page className='pdf_page' pageNumber={pageNumber} onRenderSuccess={handleRender}>
          {/* <canvas className='pdf_page' debug='true' style={{border:"1px solid black"}}/> */}
      </Page>
      </Document>
      {/* <Rect/> */}
    </>
  );
}
