import React from 'react';

function Input({
    value,
    errorMessage = null,
    handleChangeInput,
    nameClass,
    type = 'text',
    placeholder = '',
    minLength = 0,
    maxLength = null,
    required = false,
    nameInput,
}) {
    function handleChange(e) {
        console.log(e.target.value);
        handleChangeInput(e);
    }
    return (
        <>
            <input
                value={value}
                onChange={handleChange}
                noValidate
                placeholder={placeholder}
                name={nameInput}
                className={`form__input form__input_type_${nameClass}`}
                type={type}
                minLength={minLength}
                maxLength={maxLength}
                required={required}
            />
            {required && (
                <span className={`form__input-error ${errorMessage && 'form__input-error_visible'}`}>
                    {' '}
                    {errorMessage}
                </span>
            )}
        </>
    );
}
export default Input;
