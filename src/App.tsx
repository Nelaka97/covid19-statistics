import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './App.css';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetch('https://opendata.ecdc.europa.eu/covid19/casedistribution/json/')
      .then((response) => response.json())
      .then((jsonData) => {
        // Process and set the data as needed
        setData(jsonData.records);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const pageCount = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
  };

  const countryTotals: Record<string, { totalCases: number; totalDeaths: number }> = {};

  data.forEach((item) => {
    const countryName = item.countriesAndTerritories;
    const cases = item.cases;
    const deaths = item.deaths;

    if (!countryTotals[countryName]) {
      countryTotals[countryName] = {
        totalCases: cases,
        totalDeaths: deaths,
      };
    } else {
      countryTotals[countryName].totalCases += cases;
      countryTotals[countryName].totalDeaths += deaths;
    }
  });

  const filteredData = Object.keys(countryTotals)
    .filter((countryName) =>
      countryName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(pageNumber * itemsPerPage, (pageNumber + 1) * itemsPerPage);

  return (
    <div className="App">
      <h1>COVID-19 Statistics</h1>
      <div className="search-container">
        <label>Search Country:&nbsp;</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div><br/>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Country</th>
            <th>Total number of cases</th>
            <th>Total number of deaths</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((countryName, index) => (
            <tr key={index}>
              <td>{countryName}</td>
              <td>{countryTotals[countryName].totalCases}</td>
              <td>{countryTotals[countryName].totalDeaths}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ReactPaginate
        previousLabel={'Previous'}
        nextLabel={'Next'}
        pageCount={pageCount}
        onPageChange={handlePageChange}
        containerClassName={'pagination'}
        previousLinkClassName={'previous'}
        nextLinkClassName={'next'}
        disabledClassName={'disabled'}
        activeClassName={'active'}
      />
    </div>
  );
}

export default App;
