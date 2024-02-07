import React from "react";
import './Stats.css';

const data = [{
  name: "Array and Hashing"},
  {name: "Two Sum"},
]


function Stats() {
    return (
        <div className='stats'>
            <table id = "table">
              <tr id = "title1">
                <th id = "titles"> Latest Problem Solved </th>
                <th id = "add"> Type of Problems to Solve </th>
              </tr>
              <div id = "val2">
              {data.map((val, key) => {
                    return (
                        <tr key={key}>
                            <td id = "val">{val.name}</td>

                        </tr>
                    )
                })}
                </div>
            </table>
        </div>
    )
}

export default Stats;
