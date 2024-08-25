import React, { useState, useEffect, useRef } from 'react';
import Spinner from './Spinner';
import { scroller } from 'react-scroll';
import axios from "axios";
import JobListing from "./JobList";

function JobListings() {
    const [title, setTitle] = useState("Software engineer");
    const [jobSite, setSiteType] = useState("All");
    const [location, setLocation] = useState("Dallas, TX");
    const [responseData, setResponseData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [scrapeChange, setScrapeChange] = useState("True");
    const [lastRecordId, setLastRecordId] = useState(null);
    const [hasMoreData, setHasMoreData] = useState(false);
    

    const resultsRef = useRef(null); // Create a reference for the results section
    const fileInputRef = useRef(null);
    
    useEffect(() => {
      if (responseData.length > 0 && resultsRef.current) {
        scroller.scrollTo('results', {
          duration: 1000,
          delay: 0,
          smooth: 'easeInOutQuart',
          offset: -100, // Adjust if necessary
        });
      }
    }, [responseData]);

    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      } else {
        alert("Please upload a valid PDF file.");
      }
    };
    
    const handleScrapeChange = (event) => {
      setScrapeChange(event.target.value);
    };
    const handleTitleChange = (event) => {
      setTitle(event.target.value);
    };
  
    const handleJobSiteChange = (event) => {
      setSiteType(event.target.value);
    };
  
    const handleLocationChange = (event) => {
      setLocation(event.target.value);
    };
  

    const clearFileSelection = () => {
      setFile(null); // Clear the file state
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input value
      }
    };

    const sendData = async (fetchMore = false) => {
      try {
        
        setLoading(true);
        const api_url = import.meta.env.VITE_API_URL;
        const apiUrl = api_url + '/search_jobs';

        if (jobSite == '')
        {
          setSiteType('All');
        }
        console.log(jobSite);
        if (title == '')
        {
          setTitle('Software engineer');
        }
        if (location == '')
        {
          setLocation('Dallas, TX');
        }

        const formData = new FormData();
        if (file != null)
        {
          formData.append("file", file);
          console.log("File")
        }
        formData.append("job_title", title);
        formData.append("job_site", jobSite);
        formData.append("location", location);
        formData.append("scrape", scrapeChange);

        // Include lastRecordId if fetching more data
        if (fetchMore && lastRecordId) {
          formData.append("last_id", lastRecordId);
        }
        
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData
        });

        //setResponseData();
        const res = await response.json();

        // Append new data or replace existing data
        if (fetchMore) {
          setResponseData(prevData => [...prevData, ...res.result]);
        } else {
          setResponseData(res.result);
        }
          
        // Update the lastRecordId and hasMoreData
        if (res.result.length > 0) {
          setLastRecordId(res.result[res.result.length - 1].orgid); // Assuming each job has an 'id'
          setHasMoreData(res.result.length === 10);
        } else {
          setHasMoreData(false);
        }
        console.log(res);
        
        // const data = result;
        // const parseData = JSON.parse(result);
        // console.log(parseData);
        // setResponseData(res.result);
        console.log(responseData);

        // Scroll to the results section
        if (resultsRef.current && fetchMore == false) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.log(error);
      }
      finally {
        setLoading(false);
      }
    };
  
    return (
      <div  className="App">
        <div className="job-search-container" >

          <div className='container m-auto max-w-2xl py-8'>
            <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
              <label className='block text-gray-700 font-bold mb-2'>
                Title
              </label>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={handleTitleChange}
                className='border rounded w-full py-2 px-3 mb-2'
              />
              <label className='block text-gray-700 font-bold mb-2'>
                Location
              </label>
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={handleLocationChange}
                className='border rounded w-full py-2 px-3 mb-2'
              />
              <label className='block text-gray-700 font-bold mb-2'>
                Scrape data from job listing sites
              </label>
              <select
                value={scrapeChange}
                onChange={handleScrapeChange}
                className='border rounded w-full py-2 px-3'
              >
                <option value="True">Yes</option>
                <option value="False">No</option>
              </select>

              <label className='block text-gray-700 font-bold mb-2'>
                Source
              </label>
              <select
                value={jobSite}
                onChange={handleJobSiteChange}
                className='border rounded w-full py-2 px-3'
              >
                <option value="All">All Types</option>
                <option value="Indeed">Indeed</option>
                <option value="Glassdoor">Glassdoor</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
              <br/>
              <br/>
              <div className="flex flex-col items-start space-y-2">
                  <label htmlFor="pdf-upload" className='block text-gray-700 font-bold mb-2'>
                    Select Resume:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="pdf-upload"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="file:bg-indigo-500 file:hover:bg-indigo-600 file:text-white file:py-2 file:px-4 file:rounded-full file:border-none file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={clearFileSelection}
                      className=""
                    >
                      Clear file selection
                    </button>
                  </div>
              </div>
              <br/>
              <button  onClick={() => sendData(false)} className='bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline'>
                Search Jobs
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div id="results" className='bg-gray-100 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2' ref={resultsRef}>
            {responseData.map((job, index) => (
              <JobListing key={index} job={job} />
            ))}
          </div>
        )}
        {hasMoreData && !loading && (
          <button
            onClick={() => sendData(true)}
            className='bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full mt-4'
          >
            Load More
          </button>
        )}
      </div>
    );
  }
  
export default JobListings;
