import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editableRows, setEditableRows] = useState([]);

  useEffect(() => {
    GetData();
  }, []);

  const GetData = async () => {
    try {
      const response = await fetch(
        'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json'
      );

      if (!response.ok) {
        console.log('Error getting Data');
        return;
      }

      const jsonData = await response.json();
      setData(jsonData);
      setEditableRows(Array(jsonData.length).fill(false));
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Generate an array of page numbers
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  // Calculate the indexes of the items to display for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Filter data based on the search term
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Handle checkbox click
  const handleCheckboxClick = (index) => {
    const updatedSelectedRows = [...selectedRows];
    const dataIndex = indexOfFirstItem + index;
    const selectedRowIndex = updatedSelectedRows.indexOf(dataIndex);

    if (selectedRowIndex === -1) {
      updatedSelectedRows.push(dataIndex);
    } else {
      updatedSelectedRows.splice(selectedRowIndex, 1);
    }

    setSelectedRows(updatedSelectedRows);
  };

  // Handle edit button click
  const handleEditClick = (index) => {
    const updatedEditableRows = [...editableRows];
    updatedEditableRows[indexOfFirstItem + index] = true;
    setEditableRows(updatedEditableRows);
  };

  // Handle save button click
  const handleSaveClick = (index) => {
    const updatedEditableRows = [...editableRows];
    updatedEditableRows[indexOfFirstItem + index] = false;
    setEditableRows(updatedEditableRows);
  };

  // Handle delete button click
  const handleDeleteClick = (index) => {
    const updatedData = [...data];
    updatedData.splice(indexOfFirstItem + index, 1);
    setData(updatedData);
  };

  const dataKeys = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="App">
      <div className="search_container">
        <input
          type="text"
          placeholder="Enter Value..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="name">
        <div className="table-container">
          {/* Display the current items in a table */}
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === itemsPerPage * currentPage}
                    onChange={() => {}}
                  />
                </th>
                {dataKeys.map((key) => (
                  <th key={key}>{key}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(indexOfFirstItem + index)}
                      onChange={() => handleCheckboxClick(index)}
                    />
                  </td>
                  {dataKeys.map((key) => (
                    <td key={key}>
                      {editableRows[indexOfFirstItem + index] ? (
                        <input
                          type="text"
                          value={item[key]}
                          onChange={(e) => {
                            const newData = [...data];
                            newData[indexOfFirstItem + index][key] = e.target.value;
                            setData(newData);
                          }}
                        />
                      ) : (
                        item[key]
                      )}
                    </td>
                  ))}
                  <td>
                    {editableRows[indexOfFirstItem + index] ? (
                      <button onClick={() => handleSaveClick(index)}>Save</button>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(index)}>Edit</button>
                        <button onClick={() => handleDeleteClick(index)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination buttons */}
        <div className="pagination-container">
          {pageNumbers.length === 1 ? (
            <button
              key={1}
              onClick={() => setCurrentPage(1)}
              className={currentPage === 1 ? 'active' : ''}
            >
              1
            </button>
          ) : (
            pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={currentPage === number ? 'active' : ''}
              >
                {number}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
