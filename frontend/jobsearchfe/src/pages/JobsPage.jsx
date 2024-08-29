import React, { useState } from 'react';
import JobScoreDetail from '../components/JobScoreDetailsWithAI';
import HistoryList from '../components/ScoreHistory';
import ResultComponent from "../components/ScoreDetailResponse";
import Spinner from '../components/Spinner';

const JobsScoreDetailPage = () => {
  const [responseData, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState("");

  const handleSelect = async (item) => {
    const formData = new FormData();
    formData.append("id", item.score_id);


    try {
      setLoading(true);
      const api_url = import.meta.env.VITE_API_URL;
      const apiUrl = `${api_url}/get_selected_job_score`;

      // Await the fetch response and parse JSON
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      let result = {
        "Gemini Result" : data.result.score_object
      }
      setData(result);
      setDesc(data.result.job_desc);


    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null); // Optionally handle errors
    }
    finally
    {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col bg-blue-50 px-4 mt-24 ">
       {(
        <div className="">
          <HistoryList onSelect={handleSelect} />
        </div>
      )}
      <div className={`flex flex-col w-full`}>
        <JobScoreDetail description={desc} onResult={setData}/>
        {loading ? (
                    <Spinner loading={loading} />
                ) : (
        <ResultComponent data={responseData} />
                )}
      </div>
     
    </section>
  );
};

export default JobsScoreDetailPage;
