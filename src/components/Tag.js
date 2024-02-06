import React from "react"
import "./Tag.css"

const Tag = ({ color, content }) => {
    return (
        <div className="tag" style={{ backgroundColor: color }}>{content}</div>
    );
};

export default Tag;