import React from 'react';
import PopupWithForm from './PopupWithForm';
import SubmitButton from './SubmitButton';

function DeleteCardPopup({ isOpen, onClose, onDeleteCard, isLoading }) {
    function handleSubmit(e) {
        e.preventDefault();
        onDeleteCard();
    }
    return (
        <PopupWithForm
            name='deleteCard'
            isOpen={isOpen}
            onClose={onClose}
            title='Вы уверены?'
            onSubmit={handleSubmit}
        >
            <SubmitButton
                name='popup'
                isLoading={isLoading}
                isValid={true}
                loadingMessage={'Удаление...'}
                submitText='Да'
            />
        </PopupWithForm>
    );
}
export default DeleteCardPopup;
