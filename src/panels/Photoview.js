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
                            <img className="albumCover" src={item.thumb_src} alt="item.title"/>
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
    fetchAlbum: PropTypes.func
};

export default PhView;
