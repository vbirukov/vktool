import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { platform, IOS } from '@vkontakte/vkui';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import { Card, CardGrid } from '@vkontakte/vkui';

import './Workspace.css';

const osName = platform();

class Workspace extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rootData: this.props.viewItems,
            viewData: this.props.viewItems,
            mode: this.props.mode,
            level: 0
        };
    }

    getSrc(item) {
        if (this.state.mode === 'albums') {
            return item.thumb_src
        }
        switch (this.state.mode) {
            case 'albums':
                return item.src;
            case 'photos':
                const sizes = [
                    'photo_75',
                    'photo_130',
                    'photo_604',
                    'photo_807'
                ];
                let maxSize;
                sizes.forEach((sizeField) => {
                    if (item[sizeField]) {
                        maxSize = item[sizeField];
                    }
                });
                return maxSize;
        }
    }

    getAlbum = async function(albumId) {
        const album = await this.props.fetchAlbum(albumId);
        this.setState({viewData: album.response.items, mode: 'photos', level: 1});
    }

    goBack() {
        this.setState({
            viewData: this.state.rootData,
            mode: this.props.mode,
            level: 0
        });
    }

    itemClick(item) {
        switch (this.state.mode) {
            case 'albums':
                this.getAlbum(item.id);
                break;
            case 'photos':
                break;
        }
    }

    render() {
        return(<Panel id={this.props.id}>
            <PanelHeader
                left={<PanelHeaderButton onClick={this.state.level ? () => this.goBack() : this.props.go} data-to="home">
                    {osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
                </PanelHeaderButton>}
            >
                Workspace
            </PanelHeader>
            <CardGrid>
                {
                    this.state.viewData.map((item, index) => {
                        return <Card size="m"
                                     className="albumWrapper"
                                     onClick={() => this.itemClick(item)}
                                     key={index}>
                            <img className="albumCover" src={this.getSrc(item, this.props.mode)} alt="item.title"/>
                            <div className="albumTitle">
                                <p>{item.title}</p>
                            </div>
                        </Card>
                    })}
            </CardGrid>
        </Panel>)
    }
}

Workspace.propTypes = {
    id: PropTypes.string.isRequired,
    go: PropTypes.func.isRequired,
    viewItems: PropTypes.array,
    mode: PropTypes.string,
    fetchAlbum: PropTypes.func
};

export default Workspace;
