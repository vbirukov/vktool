import React, { Component } from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Workspace from './panels/Workspace';

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
			viewMode: 'albums',
			Popout: <ScreenSpinner size='large' />,
			callback: {
				requestId: 0,
				callback: null
			}
		};
	}

	METHODS_CONFIG = {
		Albums: (userId) => {
			return {
				method: 'photos.getAlbums',
				params: {
					"need_covers": true,
					"user_ids": userId ? userId : this.state.fetchedUser.id
				},
				Callback: (response) => {
					this.setState({
						viewItems: response.response.items,
						activePanel: "workspace"
					});
				}
			};
		},
		SingleAlbum: (albumId, userId) => {
			return {
				method: 'photos.get',
				params: {
					album_id: albumId,
					owner_id: userId ? userId : this.state.fetchedUser.id
				},
				Callback: (response) => {
					this.setState({
						viewItems: response.response.items,
						activePanel: "workspace"
					});
				}
			};
		},
		Friends: (userId) => {
			return {
				method: 'friends.get',
				params: {
					fields: 'photo_200_orig, sex, bdate, city, contacts',
					user_id: userId ? userId : this.state.fetchedUser.id
				},
				Callback: (response) => {
					this.setState({
						viewItems: response.response.items,
						activePanel: "workspace",
						viewMode: 'users'
					});
				}
			};
		}
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
		if (response.detail.type === 'VKWebAppCallAPIMethodResult') {
			this.state.callback(response.detail.data);
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

	fetch(Config) {
		this.setState({callback:Config.Callback});
		this.sendCommand(Config.method, Config.params).then((response) => {
			this.setState(Config.state);
			this.setState({activePanel: "workspace"});
		});
	}

	fetchAndReturn = Config => {
		return this.sendCommand(Config.method, Config.params);
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
					fetchAlbums={() => this.fetch(this.METHODS_CONFIG.Albums())}
					fetchFriends={() => this.fetch(this.METHODS_CONFIG.Friends())}
					go={this.go}/>
				<Workspace
					id='workspace'
					go={this.go}
					mode={this.state.viewMode}
					viewItems={this.state.viewItems}
					sendAPICommand={this.sendCommand}
					fetchConfig={this.METHODS_CONFIG.SingleAlbum}
					fetchAndReturn={this.fetchAndReturn}/>
			</View>
		);
	}
}

export default App;

