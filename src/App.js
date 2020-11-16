import React,{useState} from 'react'
import {useForm,useFieldArray} from 'react-hook-form'
import axios from 'axios'
import './styles.css'
import HelloSign from 'hellosign-embedded'
import SinglePagePDFViewer from "./Components/pdf/single-page";

import samplePDF from './sample.pdf'

function App(){
    const client = new HelloSign();
	const [response,setResponse] = useState('')
	const [status,setStatus] = useState('')
	const [documentId,setdocumentId] = useState('')
	const [showForm,setShowForm] = useState(false)
	const {register,control,handleSubmit} = useForm()
	const {fields,append,remove} = useFieldArray({
		control,
		name:'mails'
	})

    const sendRequests = (formData)=>{
		axios.post('http://localhost:3001/getSignedRequest',formData)
		.then(resp=>{
			setdocumentId(resp.data)
		}) 
		.catch(err=>{
			setResponse('Something went wrong!')
		})
    }

    const createFormData = (emails)=>{
		setShowForm(false)
		let formData = {
			signers:emails.mails,
			url:'https://osc.hul.harvard.edu/assets/files/sample_addendum_0.pdf',
			requesting_email:'afaq.bin.aftab@gmail.com'
		}
		sendRequests(formData)
    }

    const signDocument = (sign_url)=>{
		client.open(sign_url, {
			clientId: '6053f62ac918f8c7ac2173c5c3f827aa',
			skipDomainVerification: true
		})
		client.on('sign', (data) => {
			setResponse('The document has been signed!.Signature ID: ' + data.signatureId);
		});
		client.on('err', (err) => {
			setResponse('Something went wrong! ',err);
		});
	}
	
	const getSignUrl = ()=>{
		let signerId = window.location.pathname.substring(1)
		axios.get(`http://localhost:3001/getSignUrl/${signerId}`)
		.then(resp=>{
			signDocument(resp.data)
		}) 
		.catch(err=>{
			setResponse('Something went wrong!')
		})
	}

    const handleForm = ()=>{
		setShowForm(true)
		if(fields.length === 0)append({})
	}

	const checkStatus = ()=>{
		axios.get(`http://localhost:3001/getStatus/${documentId}`)
		.then(resp=>{
			console.log(resp.data)
		}) 
		.catch(err=>{
			setResponse('Something went wrong!')
		})
	}

	const downloadFile = ()=>{
		axios.get(`http://localhost:3001/getDocument/${documentId}`)
		.then(resp=>{
			console.log(resp.data)
		}) 
		.catch(err=>{
			setResponse('Something went wrong!')
		})
	}

	const getDocuments = ()=>{
		axios.get(`http://localhost:3001/getMyDocuments/afaq.bin.aftab@gmail.com`)
		.then(resp=>{
			console.log(resp.data)
		}) 
		.catch(err=>{
			setResponse('Something went wrong!')
		})
	}

    return(
		<div style={{"height":"100vh","width":"100vw"}}>

			<h1>{response}</h1>
			<h1>{status}</h1>

			{
				!showForm ?
				<button onClick={handleForm}>
					Request Signing
				</button>
				: null
			}

			<button onClick={checkStatus}>
				Check Status
			</button>

			<button onClick={getSignUrl}>
				Sign Document
			</button>

			<button onClick={downloadFile}>
				Download Document
			</button>

			<button onClick={getDocuments}>
				All Documents
			</button>

			<button>
				Cancel Request
			</button>

			<button>
				Remind Users
			</button>


			{
				showForm ?
				<form onSubmit={handleSubmit(createFormData)}>
					<p>Add Signers!!!</p>
					{
						fields.map((m,i)=>(
							<div key={i}>
								<span>{i}. </span>
								<input type='email' ref={register()} name={`mails[${i}].email_address`} />
								<input type='text' ref={register()} name={`mails[${i}].name`} />
								<button type='button' onClick={()=>remove(i)}>
									Remove
								</button>
							</div>)
						)
					}
					<button type='button' onClick={()=>append({})}>
						Append
					</button>
					<button type='submit'>
						Send Requests
					</button>
					<button onClick={handleForm}>
						Cancel
					</button>
				</form>
				: null
			}
			<SinglePagePDFViewer pdf={samplePDF} />
		</div>
    )
}

export default App
