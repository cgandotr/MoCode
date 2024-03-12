import { useContext , useEffect, useState, React} from 'react';

import './Stats.css';
import { AuthContext } from '../AuthContext'; // Adjust the path to your AuthContext
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek'; // Import isoWeek plugin for dayjs

import Badge from '@mui/material/Badge';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

import { PieChart } from '@mui/x-charts/PieChart';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import Switch from '@mui/material/Switch';
import SwipeableViews from 'react-swipeable-views';
import { Tabs, Tab, Typography } from '@mui/material';
import { tab } from '@testing-library/user-event/dist/tab';
import TextField from '@mui/material/TextField';


const getWeekRange = (weekNumber, year) => {
    const startOfWeek = dayjs().year(year).week(weekNumber).startOf('week');
    const endOfWeek = startOfWeek.clone().endOf('week');
    return { startOfWeek, endOfWeek };
};



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



function ServerDay(props) {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  
    const isSelected =
      !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;
  
    return (
      <Badge
        key={props.day.toString()}
        overlap="circular"
        badgeContent={isSelected ? '🔥' : undefined}
        sx={{
            ...(isSelected && {
              '.MuiPickersDay-root': { // Apply the background color to the day itself
                backgroundColor: 'var(--boxes-background)'
              },
            }),
          }}
      >
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    );
  }

function Stats() {
    
    const [highlightedDays, setHighlightedDays] = useState([]);

    const [probsToDisplay, setProbsToDisplay] = useState([]);

    const { userProblems, problems } = useContext(AuthContext);
    
    const [tabvalue, setTabValue] = useState(0);

    const [calendarvalue, setCalendarValue] = useState(dayjs());

    const [currDate, setCurrDate] = useState(dayjs());

  // Determine the start and end of the current month
  const currentMonthStart = dayjs().startOf('month');
  const currentMonthEnd = dayjs().endOf('month');


  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setTabValue(index);
  };

  const getData = () => {
    let problemsToDisplay = [];
        userProblems.forEach(problem => {
            problem.dateCompleted.forEach((dc, index) => {
                let current_date = dayjs(currDate).format("ddd MMM DD YYYY");
                if(dc != null){
                    console.log("dc: " + dc.toDate().toDateString());
                    console.log(current_date);
                    if(current_date === dc.toDate().toDateString()){
                        problemsToDisplay.push(problem);
                    }   
                }

            })
        });

    problemsToDisplay.forEach(problem => {
        console.log("ENTRY");
        let probName = problem ? problems.find(p => p.link === problem.problemLink) : null;
        console.log("PROBNAME: " + probName.title);
        problem.prob_name = probName.title;
    })


    // Deduplicate the days before returning
    return [...new Set(problemsToDisplay)];
  };

  const handleChangeDate = (newDate) => {
    console.log("NEWDATE" + newDate);
    setCurrDate(newDate);
    console.log("NEW CURR DATE: " + currDate);
    setProbsToDisplay(getData());
    console.log("probsToDisplay: ", probsToDisplay);
  }

  useEffect(() => {
    const getHighlightedDays = () => {
        // const currentMonthStart = dayjs().startOf('month');
        // const currentMonthEnd = dayjs().endOf('month');

        // // Initialize an empty array to store all highlighted days
        // let allHighlightedDays = [];

        // // Iterate through each userProblem
        // userProblems.forEach(problem => {
        //     problem.status.forEach((status, index) => {
        //         // Check if the status is "Complete" or "Incomplete"
        //         if (status === "Complete" || status === "Incomplete") {
        //             // Convert the corresponding dateCompleted to dayjs and check if it's within the current month
        //             const attemptDate = dayjs(problem.dateCompleted[index].toDate());
        //             if (attemptDate.isAfter(currentMonthStart) && attemptDate.isBefore(currentMonthEnd)) {
        //                 // If so, add this day to the allHighlightedDays array
        //                 allHighlightedDays.push(attemptDate.date());
        //             }
        //         }
        //     });
        // });
        /*

        const currentMonthStart = dayjs().startOf('month');
        const currentMonthEnd = dayjs().endOf('month');

        let allHighlightedDays = [];

        userProblems.forEach(problem => {
            problem.status.forEach((status, index) => {
                if(status === "Complete"){
                    const dateCompleted = dayjs(problem.dateCompleted[index].toDate());
                    if (dateCompleted.isAfter(currentMonthStart) && dateCompleted.isBefore(currentMonthEnd)) {
                        allHighlightedDays.push(dateCompleted.date());
                    }
                }
            })
        });
        */
        let problemsToDisplay = [];
        userProblems.forEach(problem => {
            problem.dateCompleted.forEach((dc, index) => {
                let current_date = dayjs(currDate).format("ddd MMM DD YYYY");
                if(dc != null){
                    console.log("dc: " + dc.toDate().toDateString());
                    console.log(current_date);
                    if(current_date === dc.toDate().toDateString()){
                        problemsToDisplay.push(problem);
                    }   
                }

            })
        });

        // Deduplicate the days before returning
        return [...new Set(problemsToDisplay)];
    };
}, [userProblems]); // Re-run this effect if userProblems changes

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

    const renderDay = (day, selectedDates, pickersDayProps) => {
        return <div>hi</div>
      };
    
      const calculateHoursSpent = (weekNumber) => {
        // Make sure to call .year() to get the current year as a number
        const { startOfWeek, endOfWeek } = getWeekRange(weekNumber, dayjs().year());
    
        const secondsInHour = 3600;
        
        const hours = userProblems.reduce((totalHours, problem) => {
            // Iterate over the status array for each problem
            return problem.status.reduce((acc, currentStatus, index) => {
                if (currentStatus === "Complete" || currentStatus === "InComplete") {
                    const completionDate = dayjs(problem.dateCompleted[index].toDate());
                    if (completionDate.isAfter(startOfWeek) && completionDate.isBefore(endOfWeek)) {
                        // Convert seconds to hours and accumulate
                        const hoursForProblem = problem.timeDuration[index] / secondsInHour;
                        return acc + hoursForProblem;
                    }
                }
                return acc;
            }, totalHours);
        }, 0);
    
        // Round the total hours to the nearest whole number
        const roundedHours = Math.round(hours);
        
        console.log(roundedHours);
        return roundedHours;
    };

   
    return (
        <div className='stats'>
            <div id="top-3">
                <h3 id="top-3-words">Top 3 Questions</h3>
                <div id="list">
                    {top3Problems.map((userProblem, index) => (
                        <div id="three" key={index}>
                            <h4 id="title3">{getProblemTitle(userProblem.problemLink)}</h4>
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
                    value={tabvalue}
                    onChange={handleChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTabs-indicator': {backgroundColor: 'var(--main-font-color)'},
                        '& .MuiTab-root': { color: 'var(--faint-font-color)'},
                        '& .Mui-selected': { color: 'var(--main-font-color)'},
                        '& .MuiTab-fullWidth.Mui-selected': { color: 'var(--button-color)'},
                      }}
                >
                    <Tab label="Category" />
                    <Tab label="Calender" />
                </Tabs>
                <SwipeableViews
                    axis={'x'}
                    index={tabvalue}
                    onChangeIndex={handleChangeIndex}
                >
                    <TabPanel value={tabvalue} index={0}>
                            <PieChart id="pie"
                                slotProps={{ legend: { hidden: true } }}
                                // skipAnimation
                                series={[{
                                    data: pieChartData,
                                    highlightScope: { faded: 'global', highlighted: 'item' },
                                
                                }]}
                                sx={{
                                }}
                            height={225}
                            width={300}
            
                        /> 
                    </TabPanel>
                    <TabPanel value={tabvalue} index={1}>
                    
                    <LocalizationProvider dateAdapter={AdapterDayjs} localeText={{
                        calendarWeekNumberHeaderText: 'hrs',
                        calendarWeekNumberText: (weekNumber) => `${calculateHoursSpent(weekNumber)}`,
                    }}>
                        {/* <DateCalendar
                            views={['day']}
                            value={calendarvalue}
                            onChange={(newValue) => {
                            setCalendarValue(newValue);
                            }}
                            renderInput={() => <></>} // Render nothing or your custom input component
                            minDate={currentMonthStart}
                            maxDate={currentMonthEnd}
                            renderDay={renderDay}
                            slots={{
                                day: ServerDay,
                            }}
                            slotProps={{
                                day: {
                                highlightedDays,
                                },
                            }}
                            disabled
                            displayWeekNumber

                            

                            sx={{
                            '& .MuiDayCalendar-weekNumberLabel': { color: 'var(--main-font-color)'},
                            '& .MuiDayCalendar-weekNumber': { color: 'var(--faint-font-color)'},
                            '& .MuiDayCalendar-root': { scale: "0.8", marginTop: "-20px"},
                            '& .MuiPickersCalendarHeader-label': { color: 'var(--main-font-color)' },
                            '& .MuiDayCalendar-weekDayLabel': { color: 'var(--main-font-color)' },
                            '& .MuiDayCalendar-header': { backgroundColor: 'var(--boxes-background)', borderRadius: '50px', marginBottom: "10" },
                            '& .MuiSvgIcon-root.MuiSvgIcon-fontSizeInherit.css-1vooibu-MuiSvgIcon-root' : { opacity: '0'},
                            '& .MuiButtonBase-root.Mui-disabled' : {color: 'var(--main-font-color)' },
                            '& .css-jgls56-MuiButtonBase-root-MuiPickersDay-root.Mui-disabled.css-jgls56-MuiButtonBase-root-MuiPickersDay-root.Mui-selected' : {backgroundColor: 'var(--button-color)', opacity: "1", color: "white"}
                            }}
                        /> */}
                        <DateCalendar 
                            views={['day']}
                            value={currDate}
                            onChange={(newValue) => handleChangeDate(newValue)}
                            minDate={currentMonthStart}
                            maxDate={currentMonthEnd}
                            renderInput={(params) => <TextField {...params} />}
                            sx={{
                            '& .MuiDayCalendar-weekNumberLabel': { color: 'var(--main-font-color)'},
                            '& .MuiDayCalendar-weekNumber': { color: 'var(--faint-font-color)'},
                            '& .MuiDayCalendar-root': { scale: "0.8", marginTop: "-20px", marginRight: "40px"},
                            '& .MuiPickersCalendarHeader-label': { color: 'var(--main-font-color)' },
                            '& .MuiDayCalendar-weekDayLabel': { color: 'var(--main-font-color)' },
                            '& .MuiDayCalendar-header': { backgroundColor: 'var(--boxes-background)', borderRadius: '50px', marginBottom: "10" },
                            '& .MuiSvgIcon-root.MuiSvgIcon-fontSizeInherit.css-1vooibu-MuiSvgIcon-root' : { opacity: '0'},
                            '& .MuiButtonBase-root.Mui-disabled' : {color: 'var(--main-font-color)' },
                            '& .css-jgls56-MuiButtonBase-root-MuiPickersDay-root.Mui-disabled.css-jgls56-MuiButtonBase-root-MuiPickersDay-root.Mui-selected' : {backgroundColor: 'var(--button-color)', opacity: "1", color: "white"},
                            '& .MuiPickersDay-root': { color: 'white' }, 
                            '& .MuiPickersDay-root.Mui-disabled': { color: 'rgba(255, 255, 255, 0.5)' }, 
                        }}
                        />
                        </LocalizationProvider>
                        {probsToDisplay.length > 0 && (
                            <div id = "questions2">Questions Completed</div>
                        )}
                        <ul id = "questions">
                            {probsToDisplay.map((problem, index) => (
                                <li key={index}>
                                {problem.prob_name ? problem.prob_name : 'No Name'}
                                </li>
                            ))}
                        </ul>
                        
                    </TabPanel>
                </SwipeableViews>
            </div>
    </div>

    
    );
}

export default Stats;


