import { useContext , useEffect, useState, React} from 'react';

import './Stats.css';
import { AuthContext } from '../AuthContext'; // Adjust the path to your AuthContext
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { PieChart } from '@mui/x-charts/PieChart';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import Switch from '@mui/material/Switch';
import SwipeableViews from 'react-swipeable-views';
import { Tabs, Tab, Typography } from '@mui/material';

// const data = [{
//   name: "Array and Hashing"},
//   {name: "Two Sum"},
// ]
function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  



const categoryColors = {
    "Arrays & Hashing":  "#d65a5a",
    "Two Pointers": "#d6855a",
    "Sliding Window": "#d6b35a",
    "Stack": "#b1d65a",
    "Binary Search": "#5ad666",
    "Linked List": "#757dd1",
    "Trees": "#5a96d6",
    "Tries": "#5a68d6",
    "Heap / Priority Queue": "#815ad6",
    "Backtracking": "#bd5ad6",
    "Graphs": "#d65ab3",
    "Advanced Graphs": "#d65a64",
    "1-D Dynamic Programming": "#5B60D0",
    "2-D Dynamic Programming": "#5B60D0",
    "Greedy": "#5B60D0",
    "Intervals": "#5B60D0",
    "Math & Geometry": "#5B60D0",
    "Bit Manipulation": "#5B60D0",
    "JavaScript": "#5B60D0",
};

function Stats() {
    const { userProblems, problems } = useContext(AuthContext);
    
    const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

        // Ensure userProblems is sorted by the length of their status array in descending order,
        // but only count 'Complete' or 'Incomplete' statuses.
        const sortedProblems = [...userProblems].sort((a, b) => {
            // Calculate the count of 'Complete' or 'Incomplete' for each problem
            const aCount = a.status.filter(status => status === "Complete" || status === "InComplete").length;
            const bCount = b.status.filter(status => status === "Complete" || status === "InComplete").length;
        
            return bCount - aCount;
        });

        // console.log(sortedProblems)
        
        // Select top 3 problems
        const top3Problems = sortedProblems.slice(0, 3);
  

    // Find the problem title based on the link
    const getProblemTitle = (problemLink) => {
        const matchedProblem = problems.find(p => p.link === problemLink);
        return matchedProblem ? matchedProblem.title : '...';
    };



    const [pieChartData, setPieChartData] = useState([]);


    useEffect(() => {
        // Calculate category frequencies based on completed problems
        const categoryFrequencies = userProblems.reduce((acc, curr) => {
            // Check if the problem has been completed at least once
            if (curr.status.includes("Complete")) {
                // Find the problem to get its category
                const problem = problems.find(p => p.link === curr.problemLink);
                const category = problem ? problem.category : 'Unknown';
                // Increment the count for this category
                acc[category] = (acc[category] || 0) + 1;
            }
            return acc;
        }, {});
    
        // Convert the frequencies to data the PieChart can use
        const chartData = Object.keys(categoryFrequencies).map((category, index) => ({
            id: index,
            value: categoryFrequencies[category],
            label: category,
            color: categoryColors[category] // Optional: Assign a color for each category if desired
        }));
    
        setPieChartData(chartData);
    }, [userProblems, problems]);
    
    

    // const data = [
    //     { value: 10, label: 'series A', color: "#d65a5a" },
    //     { value: 15, label: 'series B' },
    //     { value: 20, label: 'series C' },
    //   ];



    return (
        <div className='stats'>
            <div id="top-3">
                <h3>Top 3 Questions</h3>
                <div id="list">
                    {top3Problems.map((userProblem, index) => (
                        <div id="three" key={index}>
                            <h4>{getProblemTitle(userProblem.problemLink)}</h4>
                            <h4 id="number">{userProblem.status.filter(status => status === "Complete" || status === "InComplete").length}</h4>
                        </div>
                    ))}
                    {/* Fill in blanks with ellipses if less than 3 */}
                    {Array(3 - top3Problems.length).fill().map((_, index) => (
                        <div id="three" key={`blank-${index}`}>
                        <h3>...</h3>
                        </div>
                    ))}
                </div>
            </div>
      
            <div id="bottom-stats">
                <Tabs 
                    value={value}
                    onChange={handleChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTabs-indicator': {
                          // Change the indicator color
                          backgroundColor: 'var(--main-font-color)',
                        },
                        '& .MuiTab-root': {
                          // Change the text color for all tabs
                          color: 'var(--faint-font-color)',
                        },
                        '& .Mui-selected': {
                          // Change the text color for the selected tab
                          color: 'var(--main-font-color)',
                        },
                      }}
                >
                    <Tab label="Category" />
                    <Tab label="Calender" />
                </Tabs>
                <SwipeableViews
                    axis={'x'}
                    index={value}
                    onChangeIndex={handleChangeIndex}
                >
                    <TabPanel value={value} index={0}>
                    <Stack direction="row" width="100%" textAlign="center" spacing={1}  id="stack">
                                <Box flexGrow={1} id="box">
                                    <PieChart id="pie"
                                        slotProps={{ legend: { hidden: true } }}
                                        // skipAnimation
                                        series={[{
                                            data: pieChartData,
                                            highlightScope: { faded: 'global', highlighted: 'item' },
                                        
                                        }]}
                                        sx={{
                                            // width: [100, 200, 300] 
                                        }}
                                    height={300}
                                    width={300}
                    
                                /> 
                                </Box>
                            </Stack>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        localeText={{
                            calendarWeekNumberHeaderText: '#',
                            calendarWeekNumberText: (weekNumber) => `${weekNumber}.`,
                        }}
                        >
                        <DateCalendar 
                          readOnly={true}

                            sx={{
                            '& .MuiPickersCalendarHeader-label': { // Targets all text within the component
                                color: 'var(--main-font-color)',
                            },
                            '& .MuiSvgIcon-root': {
                                color: 'var(--faint-font-color)',
                            },
                            '& .MuiPickersYear-yearButton': {
                                color: 'var(--main-font-color)',
                            },
                            '& .MuiPickersDay-root': {
                                color: 'var(--main-font-color)',
                            },
                            '& .MuiDayCalendar-weekDayLabel': {
                                color: 'var(--main-font-color)',
                            },
                            
                            '& .MuiDayCalendar-header': {
                                backgroundColor: 'var(--boxes-background)',
                                borderRadius: '50px',
                            },

                            '& .css-1u23akw-MuiButtonBase-root-MuiPickersDay-root.Mui-selected': {
                                backgroundColor: 'rgba(0, 0, 0, 0)',
                            },

                              
                             
                             
                        
                              }}
                        />
                        </LocalizationProvider>
                    </TabPanel>
                </SwipeableViews>
            </div>
    </div>

    
    );
}

export default Stats;


