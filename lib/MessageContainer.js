import PropTypes from 'prop-types';
import React from 'react';
import { FlatList, View, StyleSheet, Keyboard, TouchableOpacity, Text, NativeModules, ScrollView, } from 'react-native';
import LoadEarlier from './LoadEarlier';
import Message from './Message';
import Color from './Color';
import { warning } from './utils';
var RCTUIManager = NativeModules.UIManager;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerAlignTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    contentContainerStyle: {
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    headerWrapper: {
        flex: 1, borderTopColor: 'black', borderTopWidth: 0.5,
    },
    listStyle: {
        flex: 1,
        borderTopColor: 'black', borderTopWidth: 0.5,
    },
    scrollToBottomStyle: {
        opacity: 0.8,
        position: 'absolute',
        right: 10,
        bottom: 30,
        zIndex: 999,
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: Color.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Color.black,
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 1,
    },
});
export default class MessageContainer extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            showScrollBottom: false,
            dimensionsFltList: { height: 0, width: 0 }
        };
        this.attachKeyboardListeners = () => {
            const { invertibleScrollViewProps: invertibleProps } = this.props;
            if (invertibleProps) {
                Keyboard.addListener('keyboardWillShow', invertibleProps.onKeyboardWillShow);
                Keyboard.addListener('keyboardDidShow', invertibleProps.onKeyboardDidShow);
                Keyboard.addListener('keyboardWillHide', invertibleProps.onKeyboardWillHide);
                Keyboard.addListener('keyboardDidHide', invertibleProps.onKeyboardDidHide);
            }
        };
        this.detachKeyboardListeners = () => {
            const { invertibleScrollViewProps: invertibleProps } = this.props;
            Keyboard.removeListener('keyboardWillShow', invertibleProps.onKeyboardWillShow);
            Keyboard.removeListener('keyboardDidShow', invertibleProps.onKeyboardDidShow);
            Keyboard.removeListener('keyboardWillHide', invertibleProps.onKeyboardWillHide);
            Keyboard.removeListener('keyboardDidHide', invertibleProps.onKeyboardDidHide);
        };
        this.renderFooter = () => {
            if (this.props.renderFooter) {
                const footerProps = {
                    ...this.props,
                };
                return this.props.renderFooter(footerProps);
            }
            return null;
        };
        this.renderLoadEarlier = () => {
            if (this.props.loadEarlier === true) {
                const loadEarlierProps = {
                    ...this.props,
                };
                if (this.props.renderLoadEarlier) {
                    return this.props.renderLoadEarlier(loadEarlierProps);
                }
                return <LoadEarlier {...loadEarlierProps} />;
            }
            return null;
        };
        this.scrollToBottom = (animated = true) => {
            const { inverted } = this.props;
            if (inverted) {
                this.scrollTo({ offset: 0, animated });
            }
            else {
                // this.props.forwardRef.current.scrollToEnd({ animated });
            }
        };
        this.handleOnScroll = (event) => {
            const { nativeEvent: { contentOffset: { y: contentOffsetY }, contentSize: { height: contentSizeHeight }, layoutMeasurement: { height: layoutMeasurementHeight }, }, } = event;
            const { scrollToBottomOffset } = this.props;
            if (this.props.inverted) {
                if (contentOffsetY > scrollToBottomOffset) {
                    this.setState({ showScrollBottom: true });
                }
                else {
                    this.setState({ showScrollBottom: false });
                }
            }
            else {
                if (contentOffsetY < scrollToBottomOffset &&
                    contentSizeHeight - layoutMeasurementHeight > scrollToBottomOffset) {
                    this.setState({ showScrollBottom: true });
                }
                else {
                    this.setState({ showScrollBottom: false });
                }
            }
        };
        this.renderRow = ({ item, index }) => {
            if (!item._id && item._id !== 0) {
                warning('GiftedChat: `_id` is missing for message', JSON.stringify(item));
            }
            if (!item.user) {
                if (!item.system) {
                    warning('GiftedChat: `user` is missing for message', JSON.stringify(item));
                }
                item.user = { _id: 0 };
            }
            const { messages, user, inverted, ...restProps } = this.props;
            if (messages && user) {
                const previousMessage = (inverted ? messages[index + 1] : messages[index - 1]) || {};
                const nextMessage = (inverted ? messages[index - 1] : messages[index + 1]) || {};
                const messageProps = {
                    ...restProps,
                    user,
                    key: item._id,
                    currentMessage: item,
                    previousMessage,
                    inverted,
                    nextMessage,
                    position: item.user._id === user._id ? 'right' : 'left',
                };
                if (this.props.renderMessage) {
                    return this.props.renderMessage(messageProps);
                }
                return <Message {...messageProps} />;
            }
            return null;
        };
        this.renderChatEmpty = () => {
            if (this.props.renderChatEmpty) {
                return this.props.renderChatEmpty();
            }
            return <View style={styles.container} />;
        };
        this.renderHeaderWrapper = () => (<View style={[styles.headerWrapper, { marginBottom: 75 }]}>{this.renderLoadEarlier()}</View>);
        this.onLayoutList = (e) => {
            if (!this.props.inverted &&
                !!this.props.messages &&
                this.props.messages.length) {
                // setTimeout(() => this.scrollToBottom && this.scrollToBottom(false), 15 * this.props.messages.length);
            }

            // this.forwardRef.scrollToOffset({ offset: 1 })

            let { width, height } = e.nativeEvent.layout
            this.setState({ dimensionsFltList: { width, height } })
        };
        this.keyExtractor = (item) => `${item._id}`;
    }
    componentDidMount() {
        if (this.props.messages && this.props.messages.length === 0) {
            this.attachKeyboardListeners();
        }
    }
    componentWillUnmount() {
        this.detachKeyboardListeners();
    }
    componentDidUpdate(prevProps) {
        // if (!prevProps.isLoading) {
        //     this.svref.scrollTo({ y: 0, animated: false })
        // }
        if (prevProps.messages &&
            prevProps.messages.length === 0 &&
            this.props.messages &&
            this.props.messages.length > 0) {
            this.detachKeyboardListeners();
        }
        else if (prevProps.messages &&
            this.props.messages &&
            prevProps.messages.length > 0 &&
            this.props.messages.length === 0) {
            this.attachKeyboardListeners();
        }
    }
    onLayoutListNew = (width, height) => {
        // this.forwardRef.scrollToOffset({ offset: 1 })
        if (this.props.isLoading) {
        }
        // this.setState({ dimensionsFltList: { width, height } })
    }
    layouta = (e, item) => {
        // //The following code executes inside one of your component's methods, post render
        // if (this.props.scrollToMessage == item._id)
        //     console.log(this.props.forwardRef.current.scrollToOffset({ offset: this.state.dimensionsFltList.height }))

        // // setTimeout(() => {
        //     this.current[item._id]?.measure((x, y, width, height, pageX, pageY) => {
        //         // console.log(item.text)
        //         let c = this.state.dimensionsFltList.height - pageY
        //         c = c || this.state.dimensionsFltList.height
        //         if (this.props.scrollToMessage == item._id) {
        //             console.log(this.state.dimensionsFltList, pageY, height, c, this.state.dimensionsFltList.height)
        //             // console.log(this.current[item._id])
        //             this.scrollTo({ offset: c })
        //         }
        //         // this.current[item._id].focus()
        //     })
        // // })
    }
    current = {}
    scrollTo(options) {
        // if (this.props.forwardRef && this.props.forwardRef.current && options) {
        //     console.log('yess', options)
        //     this.props.forwardRef.current.scrollToOffset(options);
        // }
    }
    renderScrollBottomComponent() {
        const { scrollToBottomComponent } = this.props;
        if (scrollToBottomComponent) {
            return scrollToBottomComponent();
        }
        return <Text>V</Text>;
    }
    renderScrollToBottomWrapper() {
        const propsStyle = this.props.scrollToBottomStyle || {};
        return (<View style={[styles.scrollToBottomStyle, propsStyle]}>
            <TouchableOpacity onPress={() => this.scrollToBottom()} hitSlop={{ top: 5, left: 5, right: 5, bottom: 5 }}>
                {this.renderScrollBottomComponent()}
            </TouchableOpacity>
        </View>);
    }
    render() {
        const { inverted } = this.props;
        return (<View style={this.props.alignTop ? styles.containerAlignTop : styles.container}>
            {this.state.showScrollBottom && this.props.scrollToBottom
                ? this.renderScrollToBottomWrapper()
                : null}
            {/* <ScrollView ref={ref => this.svref = ref} onLayout={() => { this.svref.scrollTo({ y: 0, animated: false }) }} > */}
            <ScrollView horizontal>
                <FlatList ref={ref => this.forwardRef = ref} /* extraData={this.props.extraData} */ onContentSizeChange={this.onLayoutListNew} keyExtractor={this.keyExtractor} enableEmptySections automaticallyAdjustContentInsets={false} inverted={inverted} data={this.props.messages} style={styles.listStyle} contentContainerStyle={[styles.contentContainerStyle]}
                    renderItem={(props) => (
                        <View
                            onLayout={e => this.layouta(e, props.item)}
                            ref={ref => this.current[props.item._id] = ref}>
                            {this.renderRow(props)}
                        </View>
                    )}
                    {...this.props.invertibleScrollViewProps} ListEmptyComponent={this.renderChatEmpty} ListFooterComponent={this.renderHeaderWrapper} ListHeaderComponent={!inverted ? this.renderFooter : this.renderHeaderWrapper} onScroll={this.handleOnScroll} scrollEventThrottle={100} onLayout={this.onLayoutList} {...this.props.listViewProps} />
            </ScrollView>
            {/* {this.renderHeaderWrapper()} */}
            {/* </ScrollView> */}
        </View>);
    }
}
MessageContainer.defaultProps = {
    messages: [],
    user: {},
    renderChatEmpty: null,
    renderFooter: null,
    renderMessage: null,
    onLoadEarlier: () => { },
    onQuickReply: () => { },
    inverted: true,
    loadEarlier: false,
    listViewProps: {},
    invertibleScrollViewProps: {},
    extraData: null,
    scrollToBottom: false,
    scrollToBottomOffset: 200,
    alignTop: false,
    scrollToBottomStyle: {},
};
MessageContainer.propTypes = {
    messages: PropTypes.arrayOf(PropTypes.object),
    user: PropTypes.object,
    renderChatEmpty: PropTypes.func,
    renderFooter: PropTypes.func,
    renderMessage: PropTypes.func,
    renderLoadEarlier: PropTypes.func,
    onLoadEarlier: PropTypes.func,
    listViewProps: PropTypes.object,
    inverted: PropTypes.bool,
    loadEarlier: PropTypes.bool,
    invertibleScrollViewProps: PropTypes.object,
    extraData: PropTypes.object,
    scrollToBottom: PropTypes.bool,
    scrollToBottomOffset: PropTypes.number,
    scrollToBottomComponent: PropTypes.func,
    alignTop: PropTypes.bool,
};
//# sourceMappingURL=MessageContainer.js.map