import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import axios from "axios";

const Home = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [toggle, setToggle] = useState(false);
    const [email, setEmail] = useState(false);
    const [input, setInput] = useState({ subject: '', html: '' });
    const [getEmail, setGetEmail] = useState(null);
    const [time, setTime] = useState(30 * 60); // 5 minutes in seconds
    const [isActive, setIsActive] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Store the selected file
    };

    const handleHtmlFileChange = (e) => {
        const htmlFile = e.target.files[0];
        if (htmlFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setInput((prev) => ({ ...prev, html: event.target.result }));
            };
            reader.readAsText(htmlFile);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file) {
            setToggle(true);
            toast.success('File uploaded successfully');
            const reader = new FileReader();

            reader.onload = (event) => {
                const binaryStr = event.target.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' }); // Read the file
                const sheetName = workbook.SheetNames[0]; // Get the first sheet
                const worksheet = workbook.Sheets[sheetName];
                let jsonData = XLSX.utils.sheet_to_json(worksheet); // Parse sheet to JSON

                if (jsonData.length >= 400) {
                    toast.error('Email exceeds 400 rows, file rejected');
                    setFile(null);  // Clear the file state
                    return; // Stop further execution
                }

                setData(jsonData); // Store the parsed data

                // Extract email addresses using map
                const emailAddresses = jsonData.map((item) => item.Email);

                setGetEmail(emailAddresses);
            };

            reader.readAsBinaryString(file); // Read the file as binary
        } else {
            toast.error('No file selected');
        }
    };

    const sendBackendData = async () => {
        try {

            if (!input.subject || !input.html) {
                toast.error('Please Enter all the fields')
                return
            }


            const data = await axios.post('https://email-marketing-ogt1.onrender.com/send-email', { subject: input.subject, html: input.html, email: getEmail });
            if (data.status === 200) {
                toast.success('Emails sent successfully');
                startTimer();
            } else {
                toast.error('Error while sending the email');
            }
        } catch (error) {
            console.log(error);
            toast.error('Error while sending the email');
        }
    };
    useEffect(() => {
        let timerInterval = null;

        if (isActive && time > 0) {
            timerInterval = setInterval(() => {
                setTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (time === 0) {
            clearInterval(timerInterval);
            toast.success('Ready to send mails again!!')
            setTime(false)
            window.location.reload()
        }

        return () => clearInterval(timerInterval);

    }, [isActive, time]);

    const startTimer = () => {
        setIsActive(true);
    };

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };



    useEffect(() => {
        if (email) {
            toast.success("Email's sent successfully!!");
            setEmail(false);
        }
    }, [email, toggle]);




    return (
        <>
            <div className='h-screen bg-slate-900 container p-6'>
                {
                    isActive ? <div className='h-full bg-blur bg-slate-700 flex flex-col gap-3 justify-center items-center p-6 text-white'>
                        <p className='text-2xl font-semibold bg-red-600 px-4 py-2 '>{formatTime(time)} <span className='text-lg mt-3'>Min</span> </p>
                        <p className='font-bold text-lg'>Please wait, send mails when the timmer gets over</p>
                    </div>
                        :
                        <div className='bg-slate-200 shadow-xl h-[95%] rounded-md p-1'>
                            <form onSubmit={handleSubmit} className='flex justify-start p-2 border-b-2 border-spacing border-black m-3'>
                                <div className={`${toggle == false ? 'flex flex-col gap-1' : 'hidden'}`}>
                                    <label htmlFor="name" className="form-label text-md font-semibold">Insert Excel file</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="name"
                                        accept=".csv" // Accept only CSV files
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className={`${toggle ? 'flex flex-col gap-1 mx-2 py-1 px-3 rounded-lg' : 'hidden'}`}>
                                    <label htmlFor="subject" className="form-label text-md font-semibold">Insert subject</label>
                                    <div>
                                        <input type="text" className='p-2 form-control' id="subject" onChange={e => setInput({ ...input, subject: e.target.value })} />
                                    </div>
                                </div>
                                <div className={`${toggle ? 'flex flex-col gap-1 mx-2 py-1 px-3 rounded-lg' : 'hidden'}`}>
                                    <label htmlFor="html" className="form-label text-md font-semibold">Upload HTML file</label>
                                    <div>
                                        <input
                                            type="file"
                                            accept=".html"
                                            className='form-control'
                                            id="html"
                                            onChange={handleHtmlFileChange}
                                        />
                                    </div>
                                </div>
                                <div className='mt-6'>
                                    <button type="submit" onClick={e => setToggle(false)} className={`${toggle ? 'hidden' : 'bg-blue-600 text-slate-50 py-1 px-3 rounded-lg'}`}>
                                        Import
                                    </button>
                                </div>
                                <div className='mt-6'>
                                    <button type="button" onClick={sendBackendData} className={`${toggle ? 'bg-blue-600 text-slate-50 py-1 px-3 rounded-lg' : 'hidden'}`}>
                                        Send email
                                    </button>
                                </div>
                            </form>
                            <div className="mt-4 p-2 overflow-y-scroll h-[80%]">
                                {
                                    data == null ? <h5 className='text-center my-5'>Please import an excel file</h5> :
                                        <table className="min-w-full divide-y divide-gray-700">
                                            <thead className="bg-gray-800 text-slate-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-medium">Sr. No</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-slate-300 divide-y divide-gray-800">
                                                {data && data.map((item, index) => (
                                                    <tr className='hover:bg-slate-200 cursor-pointer' key={index}>
                                                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                                                        <td className="px-4 py-2 text-sm">{item.Email}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                }
                            </div>
                        </div>
                }
            </div>
        </>
    );
};

export default Home;