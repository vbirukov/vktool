import React from 'react';
import PropTypes from 'prop-types';
import { platform, IOS } from '@vkontakte/vkui';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import { Card, CardGrid } from '@vkontakte/vkui';

import './Photoview.css';

const osName = platform();

const getSrc = (item, mode) => {
    if (mode === 'albums') {
        return item.thumb_src
    }
    switch (mode) {
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

const PhView = props => (
    <Panel id={props.id}>
        <PanelHeader
            left={<PanelHeaderButton onClick={props.go} data-to="home">
                {osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
            </PanelHeaderButton>}
        >
            Workspace
        </PanelHeader>
        <CardGrid>
            {
                props.viewItems.map((item, index) => {
                    return <Card size="m"
                                 className="albumWrapper"
                                 onClick={() => props.fetchAlbum(item.id)}
                                 key={index}>
                            <img className="albumCover" src={getSrc(item, props.mode)} alt="item.title"/>
                            <div className="albumTitle">
                                <p>{item.title}</p>
                            </div>

                    </Card>
                })}
        </CardGrid>
    </Panel>
);

PhView.propTypes = {
    id: PropTypes.string.isRequired,
    go: PropTypes.func.isRequired,
    viewItems: PropTypes.array,
    fetchAlbum: PropTypes.func,
    mode: PropTypes.string
};

export default PhView;
