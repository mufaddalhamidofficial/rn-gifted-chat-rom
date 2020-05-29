import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Image, StyleSheet, View, ViewPropTypes, Dimensions } from 'react-native';
// TODO: support web
// @ts-ignore
import Lightbox from 'react-native-lightbox';
import ImageZoom from 'react-native-image-pan-zoom';
import Orientation from 'react-native-orientation-locker';

const styles = StyleSheet.create({
    container: {},
    image: {
        width: 150,
        height: 100,
        borderRadius: 13,
        margin: 3,
        resizeMode: 'cover',
    },
    imageActive: {
        flex: 1,
        resizeMode: 'contain',
    },
});
export default class MessageImage extends Component {
    state = {
        opened: false,
    }

    renderImage = ({ imageProps, imageStyle, currentMessage }) => {
        // console.log(this.state.opened)
        return (
            this.state.opened ?
                <ImageZoom
                    cropWidth={Dimensions.get('window').width}
                    cropHeight={Dimensions.get('window').height}
                    imageWidth={Dimensions.get('window').width}
                    imageHeight={Dimensions.get('window').height}
                >
                    <Image {...imageProps} style={[styles.imageActive, { width: Dimensions.get('window').width }]} source={{ uri: currentMessage.image }} />
                </ImageZoom>
                :
                <Image {...imageProps} style={[styles.image, imageStyle]} source={{ uri: currentMessage.image }} />
        )
    }

    render() {
        const { containerStyle, lightboxProps, imageProps, imageStyle, currentMessage, } = this.props;
        if (!!currentMessage) {
            return (<View style={[styles.container, containerStyle]}>
                <Lightbox activeProps={{
                    style: styles.imageActive,
                }} {...lightboxProps} onOpen={() => { this.setState({ opened: true });/* Orientation.lockToPortrait()  */}} onClose={() => { this.setState({ opened: false });/* Orientation.lockToLandscape() */ }}
                    renderContent={() => this.state.opened ? this.renderImage({ imageProps, imageStyle, currentMessage }) : false}>
                    {!this.state.opened ? this.renderImage({ imageProps, imageStyle, currentMessage }) : false}
                </Lightbox>
            </View >);
        }
        return null;
    }
}
MessageImage.defaultProps = {
    currentMessage: {
        image: null,
    },
    containerStyle: {},
    imageStyle: {},
    imageProps: {},
    lightboxProps: {},
};
MessageImage.propTypes = {
    currentMessage: PropTypes.object,
    containerStyle: ViewPropTypes.style,
    imageStyle: PropTypes.object,
    imageProps: PropTypes.object,
    lightboxProps: PropTypes.object,
};
//# sourceMappingURL=MessageImage.js.map