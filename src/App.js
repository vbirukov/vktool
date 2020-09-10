import React, { Component } from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Persik from './panels/Persik';
import PhView from './panels/Photoview';

const APP_ID = 7589784;

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			activePanel:'home',
			User: {},
			fetchedUser: null,
			token: null,
			viewItems: [],
			Popout: <ScreenSpinner size='large' />
		};
	}

	bridgeEventManager(response) {
		if (response.detail.type === 'VKWebAppUpdateConfig') {
			const schemeAttribute = document.createAttribute('scheme');
			schemeAttribute.value = response.detail.data.scheme ? response.detail.data.scheme : 'client_light';
			document.body.attributes.setNamedItem(schemeAttribute);
		}
		if (response.detail.type === 'VKWebAppGetAuthTokenResult') {
			this.setState({token: response.detail.token});
			console.log(`token set: ${this.state.token}`);
		}
	}

	fetchUser = async function() {
		const user = await bridge.send('VKWebAppGetUserInfo');
		this.setState({fetchedUser: user});
		bridge.send("VKWebAppGetAuthToken", {"app_id": APP_ID, "scope": "photos, video, friends, groups"})
			.then((response) => {
				this.setState({token: response.access_token});
			}).catch((e) => {
			console.log(`error: ${e} `)
		});
	}

	componentDidMount() {
		bridge.subscribe((response) => {this.bridgeEventManager(response)});
		this.fetchUser().then(this.setState({Popout: null}));
	}

	go = e => {
		this.setState({activePanel: e.currentTarget.dataset.to});
	}

	fetchAlbums = () => {
		bridge.send("VKWebAppCallAPIMethod",
			{
				"method": "photos.getAlbums",
				"request_id": "32test",
				"params": {
					"need_covers": true,
					"user_ids": this.state.fetchedUser.id,
					"v":"5.30",
					"access_token":this.state.token
				}
			})
			.then((response) => {
				this.setState({viewItems: response.response.items});
				console.log(`albums: ${this.state.albums}`);
				this.setState({activePanel: "workspace"});
			});
	}

	fetchAlbum = albumId => {
		this.sendCommand('photos.get', {
			owner_id: this.state.fetchedUser.id,
			album_id: albumId
		})
	}

	sendCommand(method, params) {
		return bridge.send("VKWebAppCallAPIMethod",
			{
				"method": method,
				"request_id": "32test",
				"params": {
					...params,
					"v":"5.30",
					"access_token":this.state.token
				}
			})
	}

	render() {
		return (
			<View activePanel={this.state.activePanel} popout={this.state.popout}>
				<Home
					id='home'
					fetchedUser={this.state.fetchedUser}
					fetchAlbums={this.fetchAlbums}
					go={this.go}/>
				<Persik id='persik' go={this.go}/>
				<PhView
					id='workspace'
					go={this.go}
					viewItems={this.state.viewItems}
					fetchAlbum={this.fetchAlbum}/>
			</View>
		);
	}
}

export default App;

