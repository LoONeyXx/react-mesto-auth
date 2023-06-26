import React from 'react';

const PopupWithForm = React.memo(function PopupWithForm({
    title,
    name,
    children,
    isOpen,
    onClose,
    submitText,
    onSubmit,
    isValid,
    isLoading,
    loadingMessage,
    onChange,
}) {
    const handleOverlayClick = React.useCallback(
        (e) => {
            if (e.target.classList.contains('popup_opened')) {
                onClose();
            }
        },
        [onClose]
    );

    return (
        <section
            onClick={handleOverlayClick}
            className={`popup popup_type_${name} ${isOpen && 'popup_opened'}`}
        >
            <div className={`popup__container`}>
                <button
                    onClick={onClose}
                    type='button'
                    className='button popup__btn-close opacity no-highlight'
                />
                <h2 className='popup__title'>{title}</h2>
                <form
                    noValidate
                    name={`popup-form-${name}`}
                    action='#'
                    className={`popup__form popup__form_type_${name}`}
                    onSubmit={onSubmit}
                    onChange={(e) => {
                        onChange(e);
                    }}
                >
                    {children}
                    <button
                        className={`button popup__btn-save popup__btn-save_type_${name} no-highlight ${
                            !isValid ? 'popup__btn-save_disabled' : ''
                        }`}
                        type='submit'
                        disabled={!isValid}
                    >
                        {isLoading ? loadingMessage : submitText}
                    </button>
                </form>
            </div>
        </section>
    );
});

export default PopupWithForm;
