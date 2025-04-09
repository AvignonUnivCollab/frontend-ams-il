const API_URL = process.env.NEXT_PUBLIC_API_URL; 

//Get request function
export const fetchData = async (endpoint) => {
  try {
    const url = `${API_URL}/${endpoint}`;
    console.log("Getting data from: ", url);
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    return null;
  }
};


//POST requets function
export const postData = async(endpoint, data) => {

    try {
        const url = `${API_URL}/${endpoint}`; 
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type" : "application/json"
          },
          body: JSON.stringify(data),
        });

        if(!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    } catch(error) {
      console.log("Posting data error: ", error);
      return null;
    }
};
