import React from "react";

const noop = () => {};

//@ts-expect-error
const FileInput = ({ value, onChange = noop, ...rest }) => (
  <div>
    {Boolean(value.length) && (
      <div>Selected files: {value.map((f: File) => f.name).join(", ")}</div>
    )}
    <label>
      Click to select some files...
      <input
        {...rest}
        style={{ display: "none" }}
        type="file"
        onChange={e => {
            //@ts-ignore
            onChange([...e.target.files]);
        }}
      />
    </label>
  </div>
);

export default FileInput;