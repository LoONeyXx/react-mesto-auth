import React, { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import '../index.css';
import Header from './Header';
import Footer from './Footer';
import Main from './Main';
import ImagePopup from './ImagePopup';
import Api from '../utils/API';
import CurrentUserContext from '../contexts/CurrentUserContext';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddCardPopup from './AddCardPopup';
import Profile from './Profile';
import DeleteCardPopup from './DeleteCardPopup';
import successLogo from '../images/success.svg';
import errorLogo from '../images/error.svg';
import Register from './Register';
import Login from './Login';
import InfoTooltip from './InfoTooltip';
import ProtectedRouteElement from './ProtectedRoute';
import { auth } from '../utils/Auth';

function App() {
    const [loggedIn, setLogin] = React.useState(false);
    const [isOpenEditProfilePopup, setEditProfilePopup] = React.useState(false);
    const [isOpenEditAvatarPopup, setEditAvatarPopup] = React.useState(false);
    const [isOpenAddCardPopup, setAddCardPopup] = React.useState(false);
    const [selectedCard, setSelectCard] = React.useState({
        name: '',
        link: '',
    });
    const [cardToBeDeleted, setToBeDeletedCard] = React.useState('');
    const [cards, setCards] = React.useState([]);
    const [currentUser, setCurrentUser] = React.useState({});
    const [isLoading, setLoading] = React.useState(false);
    const isSomePopupOpened = React.useMemo(
        () =>
            !!selectedCard.name ||
            !!cardToBeDeleted ||
            [isOpenAddCardPopup, isOpenEditAvatarPopup, isOpenEditProfilePopup].some((isOpen) => isOpen),
        [isOpenAddCardPopup, selectedCard, isOpenEditAvatarPopup, isOpenEditProfilePopup, cardToBeDeleted]
    );
    const [toolTip, setToolTip] = React.useState({});
    const navigate = useNavigate();
    const location = useLocation();

    const handleKeyEscape = React.useCallback((e) => {
        if (e.key === 'Escape') {
            closeAllPopups();
        }
    }, []);

    React.useEffect(() => {
        if (isSomePopupOpened) {
            window.addEventListener('keydown', handleKeyEscape);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyEscape);
        };
    }, [isSomePopupOpened, handleKeyEscape]);

    useEffect(() => {
        if (loggedIn) {
            startRender();
        }
    }, [loggedIn]);

    function handleLogout() {
        setLogin(false);
        localStorage.removeItem('token');
        setCurrentUser({});
    }
    async function startRender() {
        const newCards = await Api.getCardsInfo();
        const newInfo = await Api.getProfileInfo();
        setCurrentUser((prev) => ({ ...prev, ...newInfo }));
        setCards(newCards);
    }

    const validationUser = React.useCallback(
        async (token) => {
            try {
                const responce = await auth.validation(token);
                const email = responce.data.email;
                setCurrentUser((prev) => ({ ...prev, email: email }));
                navigate('/', { replace: true });
                setLogin(true);
            } catch (error) {
                console.error(error);
            }
        },
        [navigate]
    );

    useEffect(() => {
        localStorage.token && validationUser(localStorage.token);
    }, [validationUser]);

    async function handleSubmit(request, successMessage) {
        setLoading(true);
        try {
            await request();
            closeAllPopups();
            successMessage && setToolTip({ name: successMessage, link: successLogo });
        } catch (error) {
            console.error(error);
            setToolTip({ name: 'Что-то пошло не так! Попробуйте ещё раз.', link: errorLogo });
        }
        setLoading(false);
    }

    function handleCardLike(card) {
        const isLiked = card.likes.some((user) => user._id === currentUser._id);
        function makeRequest() {
            return Api.changeLikeCardStatus(card._id, isLiked).then((newCard) =>
                setCards((prev) => prev.map((prevCard) => (prevCard._id === card._id ? newCard : prevCard)))
            );
        }

        handleSubmit(makeRequest);
    }

    function handleUpdateAvatar(info) {
        function makeRequest() {
            return Api.setProfileAvatar(info).then((newUserInfo) => {
                setCurrentUser((prev) => ({ ...prev, ...newUserInfo }));
            });
        }
        handleSubmit(makeRequest, 'Аватарка успешно обновлена.');
    }

    function handleAddCard(card) {
        function makeRequest() {
            return Api.addNewCard(card).then((newCard) => {
                setCards((prev) => [newCard, ...prev]);
            });
        }
        handleSubmit(makeRequest, 'Карточка успешно добавлена.');
    }

    function handleUpdateUser(info) {
        function makeRequest() {
            return Api.setProfileInfo(info).then((newUserInfo) =>
                setCurrentUser((prev) => ({ ...prev, newUserInfo }))
            );
        }
        handleSubmit(makeRequest, 'Данный пользователя успешно обновлены.');
    }

    function handleDeleteCard(id) {
        function makeRequest() {
            return Api.deleteCard(id).then(() => {
                closeAllPopups();
                setCards((prevCards) => prevCards.filter((card) => card._id !== id));
            });
        }
        handleSubmit(makeRequest, 'Карточка успешно удалена.');
    }

    function handleRegistartion(info) {
        function makeRequest() {
            return auth.registration(info).then(() => {
                navigate('/sign-in', { replace: true });
            });
        }
        handleSubmit(makeRequest, 'Вы успешно зарегистрировались!');
    }

    function handleAuthorization(info) {
        function makeRequest() {
            return auth.authorization(info).then(({ token }) => {
                validationUser(token);
                localStorage.setItem('token', token);
            });
        }
        handleSubmit(makeRequest);
    }
    function closeAllPopups(e) {
        setEditProfilePopup(false);
        setEditAvatarPopup(false);
        setAddCardPopup(false);
        setSelectCard({ name: '', link: '' });
        setToBeDeletedCard('');
        setToolTip({ name: '', link: '' });
    }

    function handleEditAvatarClick() {
        setEditAvatarPopup(true);
    }

    function handleEditProfileClick() {
        setEditProfilePopup(true);
    }

    function handleAddPlaceClick() {
        setAddCardPopup(true);
    }

    function handleCardClick(card) {
        setSelectCard(card);
    }
    function handleDeleteClick(card) {
        setToBeDeletedCard(card._id);
    }

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <Header
                onExit={handleLogout}
                location={location}
            />

            <Routes>
                <Route
                    path='/*'
                    element={
                        <ProtectedRouteElement
                            loggedIn={loggedIn}
                            element={
                                <Main
                                    closeAllPopups={closeAllPopups}
                                    onCardClick={handleCardClick}
                                    onCardLike={handleCardLike}
                                    onCardDelete={handleDeleteClick}
                                    cards={cards}
                                >
                                    <Profile
                                        onEditAvatar={handleEditAvatarClick}
                                        onEditProfile={handleEditProfileClick}
                                        onAddPlace={handleAddPlaceClick}
                                    />
                                </Main>
                            }
                        />
                    }
                ></Route>

                {!loggedIn && (
                    <Route
                        path='/sign-up'
                        element={<Register onSubmit={handleRegistartion} />}
                    />
                )}
                {!loggedIn && (
                    <Route
                        path='/sign-in'
                        element={<Login onSubmit={handleAuthorization} />}
                    />
                )}
            </Routes>

            <InfoTooltip
                name={toolTip.name}
                onClose={closeAllPopups}
                logo={toolTip.link}
            />

            <EditProfilePopup
                onUpdateUser={handleUpdateUser}
                onClose={closeAllPopups}
                isOpen={isOpenEditProfilePopup}
                isLoading={isLoading}
            />
            <EditAvatarPopup
                onUpdateAvatar={handleUpdateAvatar}
                isOpen={isOpenEditAvatarPopup}
                onClose={closeAllPopups}
                isLoading={isLoading}
            />
            <AddCardPopup
                isLoading={isLoading}
                onClose={closeAllPopups}
                isOpen={isOpenAddCardPopup}
                onAddCard={handleAddCard}
            />
            <DeleteCardPopup
                onDeleteCard={handleDeleteCard}
                isOpen={!!cardToBeDeleted}
                onClose={closeAllPopups}
                cardToBeDeleted={cardToBeDeleted}
                isLoading={isLoading}
            />
            <ImagePopup
                card={selectedCard}
                onClose={closeAllPopups}
            />
            {loggedIn && <Footer />}
        </CurrentUserContext.Provider>
    );
}

export default App;
