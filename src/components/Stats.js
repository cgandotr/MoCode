import { useContext , useEffect, useState, React } from 'react';
import './Stats.css';

/* AuthContext Imports */
import { AuthContext } from '../AuthContext';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import SwipeableViews from 'react-swipeable-views';
import { Tabs, Tab, Typography } from '@mui/material';
import Badge from '@mui/material/Badge';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { Tooltip } from '@mui/material';
import {List, ListItem, ListItemText} from '@mui/material';

/* Other Imports */
import dayjs from 'dayjs';

/* Custom imports */
import { categoryColors } from '../index';


/*
getWeekRange()
------------------------------------
Gets start and end dates for a given week number & year
------------------------------------
inputs: weekNumber (int)
        year (int)

outputs: [startofWeek, endofWeek] dates
*/
const getWeekRange = (weekNumber, year) => {
    const startOfWeek = dayjs().year(year).week(weekNumber).startOf('week');
    const endOfWeek = startOfWeek.clone().endOf('week');
    return { startOfWeek, endOfWeek };
};


/*
TabPanel()
------------------------------------
Custom Object to help with Pie Chart/Calendar
------------------------------------
*/
function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div role="tabpanel" hidden={value !== index} id={`full-width-tabpanel-${index}`}{...other}>
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }


/*
Stats
------------------------------------
Stats Component for User Home Page
Displays:
    Top 3 Questions
    PieChart Data
    Calendar w/ Streaks and hrs/week
Used in 'Home' Component
------------------------------------
*/
function Stats() {

    /*
    AuthContext Variables
    */
    const { userProblems, problems } = useContext(AuthContext);

    /*
    State for highlighted day array
    */
    const [highlightedDays, setHighlightedDays] = useState([]);
    
    /*
    State for tab index
    */
    const [tabvalue, setTabValue] = useState(0);

    /*
    State for calendar value
    */
    const [calendarvalue, setCalendarValue] = useState(dayjs());

    /*
    State for Pie Chart Data
    */
    const [pieChartData, setPieChartData] = useState([]);

    /* Determine start/end of current month
       We only care about displaying current month info */
    const currentMonthStart = dayjs().startOf('month');
    const currentMonthEnd = dayjs().endOf('month');

    /*
    handleChangeTab()
    handleChangeSwipeableView()
    ------------------------------------
    Function that handles changing tabs
    ------------------------------------
    */
    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChangeSwipeableView = (index) => {
        setTabValue(index);
    };

    /*
    useEffect()
    ------------------------------------
    Here we get the highlighted days
    Highlighted Days should be days where a user has submited a problem
    A submitted problem indicates a user has set that status as "Complete" or "InComplete"
    Thus we get the set of days for which a user has submitted a problem
    Gets reran if userProblem changes
    ------------------------------------
    */
    useEffect(() => {
        const getHighlightedDays = () => {
            /* Initialize return array */
            let allHighlightedDays = [];

            /* Iterate through all userProblems */
            userProblems.forEach(problem => {
                problem.status.forEach((status, index) => {
                    /* Go through each status in status[] */
                    /* Check if the status is "Complete" or "Incomplete" */
                    if (status === "Complete" || status === "Incomplete") {
                        /* Get corresponding dateCompleted (by index) */
                        /* Check if it's within the current month */
                        const attemptDate = dayjs(problem.dateCompleted[index].toDate());
                        if (attemptDate.isAfter(currentMonthStart) && attemptDate.isBefore(currentMonthEnd)) {
                            /* Add date to array */
                            allHighlightedDays.push(attemptDate.date());
                        }
                    }
                });
            });

            /* Return set of all dates */
            return [...new Set(allHighlightedDays)];
        };

        /* Set the state of highlighted days */
        setHighlightedDays(getHighlightedDays());
    }, [userProblems]);


    /*
    sortedProblems
    ------------------------------------
        Array of userProblems that is sorted by the length of their status array (where status[i] == "Complete" or "InComplete")
            i.e. sorted by how many submissions the user has had for a problem
        We will use this array to determine the top3Problems
    */
    const sortedProblems = [...userProblems].sort((a, b) => {
        /* Calculate the count of 'Complete' or 'Incomplete' for each problem*/
        const aCount = a.status.filter(status => status === "Complete" || status === "InComplete").length;
        const bCount = b.status.filter(status => status === "Complete" || status === "InComplete").length;
        return bCount - aCount;
    });

        
    /*
    top3Problems
    ------------------------------------
        Array of first 3 userProblems from sortedProblems
    */
    const top3Problems = sortedProblems.slice(0, 3);
  

    /*
    getProblemTitle()
    ------------------------------------
    Gets the problem title by matching the given problem link
    Searches problems to find this match
    Returns ... if no match
    ------------------------------------
    inputs: problemLink (string)

    outputs: title (string)
    */
    const getProblemTitle = (problemLink) => {
        const matchedProblem = problems.find(p => p.link === problemLink);
        return matchedProblem ? matchedProblem.title : '...';
    };

    /*
    useEffect()
    ------------------------------------
    Here we get the Pie Chart Data
    We determine the frequency of categories where a user has completed a problem for that category
     Gets reran if userProblem changes
    ------------------------------------
    */
    useEffect(() => {
        /* Calculate category frequencies based on completed problems */
        const categoryFrequencies = userProblems.reduce((acc, curr) => {
            /* Check if the problem has been completed at least once */
            if (curr.status.includes("Complete")) {
                /* Find the problem to get its category */
                const problem = problems.find(p => p.link === curr.problemLink);
                const category = problem ? problem.category : 'Unknown';
                /* Increment the count for this category */
                acc[category] = (acc[category] || 0) + 1;
            }
            return acc;
        }, {});
        
        /* Convert the frequencies to data the PieChart can use */
        const chartData = Object.keys(categoryFrequencies).map((category, index) => ({
            id: index,
            value: categoryFrequencies[category],
            label: category,
            color: categoryColors[category]
        }));
        /* Set the state of Pie Chart Data */
        setPieChartData(chartData);
    }, [userProblems, problems]);

    
    /*
    calculateHoursSpent()
    ------------------------------------
    Gets the total number of hours given by timeDuration for a given week
    ------------------------------------
    inputs: weekNumber (int)

    outputs: hours (int)
    */
    const calculateHoursSpent = (weekNumber) => {
        /* Get the week Range */
        const { startOfWeek, endOfWeek } = getWeekRange(weekNumber, dayjs().year());

        const secondsInHour = 3600;
        
        const hours = userProblems.reduce((totalHours, problem) => {
            /* Iterate over the status array for each problem */
            return problem.status.reduce((acc, currentStatus, index) => {
                if (currentStatus === "Complete" || currentStatus === "InComplete") {
                    /* We only care about submitted problems */
                    const completionDate = dayjs(problem.dateCompleted[index].toDate());
                    /* Check if within range */
                    if (completionDate.isAfter(startOfWeek) && completionDate.isBefore(endOfWeek)) {
                        /* Convert seconds to hours and accumulate */
                        const hoursForProblem = problem.timeDuration[index] / secondsInHour;
                        return acc + hoursForProblem;
                    }
                }
                return acc;
            }, totalHours);
        }, 0);

        /*  Round the total hours to the nearest whole number */
        const roundedHours = Math.round(hours);
        return roundedHours;
    };  

    /*
    getProblemsForSpecificDate(specificDate)
    ------------------------------------
    Gets the problems submitten on a day
    ------------------------------------
    inputs: specificDate (date)

    outputs: array of problems ([] userProblems)
    */
    const getProblemsForSpecificDate = (specificDate) => {    
        /* Initialize return array */
        let problemsForDate = [];
    
        userProblems.forEach(problem => {
            problem.status.forEach((status, index) => {
                /* Go through each status in status[] */
                /* Check if the status is "Complete" or "Incomplete" */
                if (status === "Complete" || status === "InComplete") {
                    /* Get corresponding dateCompleted (by index) */
                    /* Check if it's within the current month */
                    const attemptDate = dayjs(problem.dateCompleted[index].toDate());
                    if (attemptDate.isSame(specificDate, 'day')) {                       
                        /* Add date to array */
                        problemsForDate.push(problem);
                    }
                }
            });
        });
            return problemsForDate;
    };

   /*
    ServerDay()
    ------------------------------------
    Custom Object
    Allows Streak to be render
    When Hovering Over Date, renders problems submitted
    ------------------------------------
    */
    function ServerDay(props) {
        const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

        const isHighlighted = !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;
    
        const [hover, setHover] = useState(false);

        const renderTooltipContent = (day) => (
            <List dense>
            <ListItemText primary={`Submitted Problems - ${dayjs(day).format('MM/DD/YYYY')}`} />

                {getProblemsForSpecificDate(day).map((userProblem, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={`${getProblemTitle(userProblem.problemLink)}`} />
                    </ListItem>
                ))}
            </List>
        );
    

        return (
            <Tooltip
                title={renderTooltipContent(day)}
                open={hover && isHighlighted}
                placement="top"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                PopperProps={{
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, 8], // Adjust the position of the tooltip (x, y)
                        },
                      },
                    ],
                    sx: {
                      // Tooltip background color, text color, etc.
                      '& .MuiTooltip-tooltip': {
                        bgcolor: 'rgb(27, 148, 247)',
                        color: 'white',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)',
                        witdh: '1300000000px', 
                        boxRadius: '50 50 50 50',
                      },
                      // Tooltip arrow color
                      '& .MuiTooltip-arrow': {
                        color: 'background.paper', // Match the tooltip's background
                      },
                    },
                  }}
            >
                <Badge
                    key={day.toString()}
                    overlap="circular"
                    badgeContent={isHighlighted ? '🔥' : undefined}
                    sx={{
                        ...(isHighlighted && {
                        '.MuiPickersDay-root': { 
                            backgroundColor: 'var(--boxes-background)',
                        },
                        }),
                    }}
                >
                    <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
                </Badge>
            </Tooltip>
        );
    }


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
                    onChange={handleChangeTab}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTabs-indicator': {backgroundColor: 'var(--main-font-color)'},
                        '& .MuiTab-root': { color: 'var(--faint-font-color)'},
                        '& .Mui-selected': { color: 'var(--main-font-color)'},
                        '& .MuiTab-fullWidth.Mui-selected': { color: 'var(--button-color)'},
                      }}
                >
                    <Tab label="Category" />
                    <Tab label="Calendar" />
                </Tabs>
                <SwipeableViews
                    axis={'x'}
                    index={tabvalue}
                    onChangeIndex={handleChangeSwipeableView}
                >
                    <TabPanel value={tabvalue} index={0}>
                            <PieChart id="pie"
                                slotProps={{ legend: { hidden: true } }}
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
                        <DateCalendar
                            views={['day']}
                            value={calendarvalue}
                            onChange={(newValue) => {
                            setCalendarValue(newValue);
                            }}
                            renderInput={() => <></>}
                            minDate={currentMonthStart}
                            maxDate={currentMonthEnd}
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
                            '& .MuiButtonBase-root.Mui-disabled.MuiPickersDay-root.Mui-disabled.MuiPickersDay-dayWithMargin': { color: 'var(--main-font-color)'},
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
                        />
                        </LocalizationProvider>
                    </TabPanel>
                </SwipeableViews>
            </div>
        </div>
    );
}

export default Stats;


