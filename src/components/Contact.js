import React, { useState } from 'react';
import './Contact.css';

/* MUI Library Imports */
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';

/* Email JS Import */
import emailjs from 'emailjs-com';


/*
Contact
------------------------------------
Component that lives in the 'App' Component
Basically takes care of user input to send a message to MoCode Developers
*/
function Contact() {
    /*
    States for User Input for Contact Component
    */
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    /*
    validateEmail()
    ------------------------------------
    Function that checks if email is in valid form
    ------------------------------------
    inputs: email (string)

    outputs: boolean (indicating is email is valid)
    */
    const validateEmail = (email) => {
        return email.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
      };
      
    
    /*
    sendEmail()
    ------------------------------------
    Function that uses Email Js to send an email using Email Js Service
    Called by button w/ id="email-btn" via onClick
    ------------------------------------
    */

    /*
    Constants for Email Js Service
    ----------------------------------
    Tied with camiillee.ag@gmail.com
    */
    const SERVICE_ID = 'service_y4syvsr';
    const TEMPLATE_ID = 'template_0zgo897';
    const USER_ID = '4naN3RmqX87NBAZnd';

    const sendEmail = (event) => {
        event.preventDefault();
        // Validate Email before sending
        if (!validateEmail(email)) {
            alert('Invalid Email');
            return;
        }
        // Send Email
        emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            firstName: firstName,
            lastName: lastName,
            fromEmail: email,
            message: message,
        }, USER_ID)
        .then((result) => {
            console.log(result.text);
            alert('Message sent successfully!');
        }, (error) => {
            console.log(error.text);
            alert('Failed to send the message, please try again.');
        });
    };


    return (
        <div className='contact'>
            <h2>Contact Us</h2>
            <FormControl fullWidth sx={{ '& .MuiTextField-root': { m: 1 } }}> {/* Use FormControl to group inputs and apply spacing */}
                <div id="contact-names">
                    <TextField
                        variant="filled"
                        id="first-name"
                        label="First Name"
                        size='small'
                        value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        sx={{
                            '& .MuiFilledInput-root': { backgroundColor: "var(--boxes-background)"},
                            '&.Mui-focused': { backgroundColor: 'var(--boxes-background)' },
                            '& .MuiInputBase-colorPrimary': { color: "var(--main-font-color-two)" },
                            '& .MuiInputLabel-sizeSmall' : { color: "var(--faint-font-color)" },
                            '& .MuiFilledInput-underline' : { color: "var(--main-font-color-two)" }
                        }}
                    />
                    <TextField
                        id="last-name"
                        label="Last Name"
                        variant="filled"
                        size='small'
                        value={lastName} onChange={(e) => setLastName(e.target.value)}
                        sx={{
                            '& .MuiFilledInput-root': { backgroundColor: "var(--boxes-background)" },
                            '&.Mui-focused': { backgroundColor: 'var(--boxes-background)' },
                            '& .MuiInputBase-input': { color: "var(--main-font-color-two)" },
                            '& .MuiInputBase-colorPrimary': { color: "var(--main-font-color-two)" },
                            '& .MuiInputLabel-sizeSmall' : { color: "var(--faint-font-color)" },
                            '& .MuiFilledInput-underline' : { color: "var(--main-font-color-two)" }
                        }}
                    />
                </div>
                <div id = "boxes">
                    <TextField
                        variant="filled"
                        required
                        label="Email Address"
                        size='small'
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        sx={{
                            '& .MuiFilledInput-root': { backgroundColor: "var(--boxes-background)" },
                            '&.Mui-focused': { backgroundColor: 'var(--boxes-background)' },
                            '& .MuiInputBase-input': { color: "var(--main-font-color-two)" },
                            '& .MuiInputBase-colorPrimary': { color: "var(--main-font-color-two)" },
                            '& .MuiInputLabel-sizeSmall' : { color: "var(--faint-font-color)" },
                            '& .MuiFilledInput-underline' : { color: "var(--main-font-color-two)" }
                        }}
                    />
                    <TextField
                        variant="filled"
                        label="Message"
                        multiline
                        rows={3}
                        helperText="Enter your message"
                        value={message} onChange={(e) => setMessage(e.target.value)}
                        sx={{
                            '& .MuiFilledInput-root': { backgroundColor: "var(--boxes-background)" },
                            '&.Mui-focused': { backgroundColor: 'var(--boxes-background)' },
                            '& .MuiInputBase-input': { color: "var(--main-font-color-two)" },
                            '& .MuiInputBase-colorPrimary': { color: "var(--main-font-color-two)" },
                            '& .MuiInputLabel-sizeMedium' : { color: "var(--faint-font-color)" },
                            '& .MuiFilledInput-underline' : { color: "var(--main-font-color-two)" }
                        }}
                    />
                    <Button id="email-btn" variant="contained" color="primary" type="submit" onClick={sendEmail}>
                            Send Message
                    </Button>
                </div>
            </FormControl>
        </div>
    );
}

export default Contact;


