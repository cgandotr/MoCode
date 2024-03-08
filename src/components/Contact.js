import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import './Contact.css';
import Button from '@mui/material/Button';
import emailjs from 'emailjs-com';

function Contact() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const validateEmail = (email) => {
        return email.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
      };
      
    
    const sendEmail = (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            alert('Invalid Email');
            return;
        }
        emailjs.send('service_y4syvsr', 'template_0zgo897', {
            firstName: firstName, // These keys must match your template variables
            lastName: lastName,
            fromEmail: email,
            message: message,
        }, '4naN3RmqX87NBAZnd')
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
                        value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        sx={{
                            '& .MuiFilledInput-root': { 
                                backgroundColor: "var(--boxes-background)",
                            },
                            '&.Mui-focused': {
                                backgroundColor: 'var(--boxes-background)', 
                            },
                            '& .MuiInputBase-input': { 
                                color: "var(--main-font-color-two)"
                            },
                            '& .MuiInputBase-colorPrimary': {
                                color: "var(--main-font-color-two)"
                            },
                            '& .MuiInputLabel-sizeMedium' : {
                                color: "var(--main-font-color-two)"
                            },
                            '& .MuiFilledInput-underline' : {
                                color: "var(--main-font-color-two)"
                            }
                        }}
                    />
                    <TextField
                        id="last-name"
                        label="Last Name"
                        variant="filled"
                        value={lastName} onChange={(e) => setLastName(e.target.value)}
                        sx={{
                            '& .MuiFilledInput-root': { 
                                backgroundColor: "var(--boxes-background)",
                            },
                            '&.Mui-focused': {
                                backgroundColor: 'var(--boxes-background)', 
                            },
                            '& .MuiInputBase-input': { 
                                color: "var(--main-font-color-two)"
                            },
                            '& .MuiInputBase-colorPrimary': {
                                color: "var(--main-font-color-two)"
                            },
                            '& .MuiInputLabel-sizeMedium' : {
                                color: "var(--main-font-color-two)"
                            },
                            '& .MuiFilledInput-underline' : {
                                color: "var(--main-font-color-two)"
                            }
                        }}

                    />
                </div>
                <TextField
                    variant="filled"
                    label="Email Address *"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    sx={{
                        '& .MuiFilledInput-root': { 
                            backgroundColor: "var(--boxes-background)",
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'var(--boxes-background)', 
                        },
                        '& .MuiInputBase-input': { 
                            color: "var(--main-font-color-two)"
                        },
                        '& .MuiInputBase-colorPrimary': {
                            color: "var(--main-font-color-two)"
                        },
                        '& .MuiInputLabel-sizeMedium' : {
                            color: "var(--main-font-color-two)"
                        },
                        '& .MuiFilledInput-underline' : {
                            color: "var(--main-font-color-two)"
                        }
                    }}
                />
                <TextField
                    variant="filled"
                    label="Message"
                    multiline
                 
                    rows={4}
                    helperText="Enter your message"
                    value={message} onChange={(e) => setMessage(e.target.value)}
                    sx={{
                        '& .MuiFilledInput-root': { 
                            backgroundColor: "var(--boxes-background)",
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'var(--boxes-background)', 
                        },
                        '& .MuiInputBase-input': { 
                            color: "var(--main-font-color-two)"
                        },
                        '& .MuiInputBase-colorPrimary': {
                            color: "var(--main-font-color-two)"
                        },
                        '& .MuiInputLabel-sizeMedium' : {
                            color: "var(--main-font-color-two)"
                        },
                        '& .MuiFilledInput-underline' : {
                            color: "var(--main-font-color-two)"
                        }
                    }}
                />
                <Button id="email-btn" variant="contained" color="primary" type="submit" onClick={sendEmail}>
                        Send Message
                    </Button>
            </FormControl>
        </div>
    );
}

export default Contact;


