const API_URL = process.env.NEXT_PUBLIC_API_URL; 



//Get request function
export const fetchData = async (endpoint) => {
  try {
    const url = `${API_URL}/${endpoint}`;
    const token = localStorage.getItem("token")

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

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
        const token = localStorage.getItem("token");
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type" : "application/json",
            ...(token && {Authorization: `Bearer ${token}`})
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if(!token && result.data.token) {
          localStorage.setItem("token", result.data.token);
        }

        if(!response.ok) {
          const text = await response.text(); 
          console.error("Server responded with:", text);
          throw new Error(`HTTP error ${response.status}`);
        }

        if (!response.ok) {
        
        }

        return result;
    } catch(error) {
      console.log("Posting data error: ", error);
      return null;
    }
};
