import { useState } from 'react';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [fileInput, setFileInput] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);
    setIsLoading(true);  // Set loading state to true

    // Validate JSON input
    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch {
      setError('Invalid JSON format');
      setIsLoading(false);  // Stop loading
      return;
    }

    // Validate file input
    if (!fileInput) {
      setError('Please upload a file');
      setIsLoading(false);  // Stop loading
      return;
    }

    // Prepare form data
    const formData = new FormData();
    parsedData.data.forEach(item => {
      formData.append('data[]', item);
    });
    formData.append('file', fileInput);

    try {
      // Call the backend API
      const res = await fetch('/api/bfhl', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        setError('Failed to fetch data from the API');
        setIsLoading(false);  // Stop loading
        return;
      }

      const data = await res.json();
      setResponse(data);
      console.log(data);
    } catch (err) {
      setError('An error occurred while fetching data');
    } finally {
      setIsLoading(false);  // Stop loading
    }
  };

  const handleSelectChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedOptions(options);
  };

  const normalizeOptionKey = (option) => {
    return option.toLowerCase().replace(/ /g, '_');
  };

  const renderFilteredResponse = () => {
    if (!response) return null;

    return selectedOptions.map(option => {
      const normalizedKey = normalizeOptionKey(option);
      return (
        <div key={normalizedKey} className="mb-2">
          <strong>{option}:</strong>
          <pre className="text-white">{JSON.stringify(response[normalizedKey], null, 2)}</pre>
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto p-6 text-white bg-gray-800">
      <h1 className="text-2xl font-bold mb-4">Submit Your Roll Number</h1>
      <form className="text-black" onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border border-gray-400 rounded mb-4"
          placeholder='Enter JSON (e.g., {"data": ["A", "C", "z"]})'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFileInput(e.target.files[0])}
          className="mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          disabled={isLoading}  // Disable button while loading
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {response && (
        <>
          <select
            multiple
            onChange={handleSelectChange}
            className="border p-2 my-4 text-black w-full"
          >
            <option value="Alphabets">Alphabets</option>
            <option value="Numbers">Numbers</option>
            <option value="Highest lowercase alphabet">Highest lowercase alphabet</option>
          </select>
          <div>
            <h2 className="text-lg font-bold">Filtered Response:</h2>
            {renderFilteredResponse()}
          </div>
        </>
      )}
    </div>
  );
}
