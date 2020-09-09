import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Persik from './panels/Persik';
import PhView from './panels/Photoview';

const App = () => {
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [albums, setAlbums] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);

	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});

		bridge.subscribe((e) => {
			if (e.detail.type === 'VKWebAppGetAuthTokenResult') {
				setToken(e);
				console.log(`token set: ${token}`);
			}
		})

		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			setUser(user);
			setPopout(null);
			bridge.send("VKWebAppGetAuthToken", {"app_id": 7589784, "scope": "photos, video, friends, groups"})
				.then((response) => {
					console.log(`got auth responce: ${response}`);
					setToken(response.access_token);
				}).catch((e) => {
					console.log(`error: ${e} `)
				});
		}
		fetchData();
	}, []);

	const go = e => {
		setActivePanel(e.currentTarget.dataset.to);
	};

	async function fetchAlbums() {
		const photos =  await bridge.send("VKWebAppCallAPIMethod",
			{
				"method": "photos.getAlbums",
				"request_id": "32test",
				"params": {
					"need_covers": true,
					"user_ids": fetchedUser.id,
					"v":"5.30",
					"access_token":token
				}
			})
			.then((response) => {
				setAlbums(response.response.items);
				console.log(`albums: ${albums}`);
				setActivePanel("phview");
			});
		console.log(`photos ${photos}`);
	}

	return (
		<View activePanel={activePanel} popout={popout}>
			<Home id='home' fetchedUser={fetchedUser} fetchAlbums={fetchAlbums} go={go} />
			<Persik id='persik' go={go}/>
			<PhView id='phview' go={go} albums={albums}/>
		</View>
	);
}

export default App;

