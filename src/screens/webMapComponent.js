
// Function to load Google Maps API
function loadGoogleMapsAPI(callback) {
    if (window.google && window.google.maps) {
      // Google Maps API is already loaded, call the callback function
      callback();
    } else {
      const apiKey = "AIzaSyA_4ZnnpViUCht6wNxvOPnmCbvp-O_rOiM"
      // Google Maps API is not loaded, dynamically load it
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = callback;
  
      // Append the script to the document
      document.head.appendChild(script);
    }
  }
  
  export default loadGoogleMapsAPI;
  