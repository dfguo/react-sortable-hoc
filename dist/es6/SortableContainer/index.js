import _extends from 'babel-runtime/helpers/extends';
import _slicedToArray from 'babel-runtime/helpers/slicedToArray';
import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Manager from '../Manager';
import { closest, events, vendorPrefix, limit, getElementMargin } from '../utils';
import invariant from 'invariant';

// Export Higher Order Sortable Container Component
export default function SortableContainer(WrappedComponent) {
	var _class, _temp;

	var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { withRef: false };

	return _temp = _class = function (_Component) {
		_inherits(_class, _Component);

		function _class(props) {
			_classCallCheck(this, _class);

			var _this = _possibleConstructorReturn(this, (_class.__proto__ || _Object$getPrototypeOf(_class)).call(this, props));

			_this.handleStart = function (e) {
				var _this$props = _this.props,
				    distance = _this$props.distance,
				    shouldCancelStart = _this$props.shouldCancelStart;


				if (e.button === 2 || shouldCancelStart(e)) {
					return false;
				}

				_this._touched = true;
				_this._pos = {
					x: e.clientX,
					y: e.clientY
				};

				var node = closest(e.target, function (el) {
					return el.sortableInfo != null;
				});

				if (node && node.sortableInfo && !_this.state.sorting) {
					var useDragHandle = _this.props.useDragHandle;
					var _node$sortableInfo = node.sortableInfo,
					    index = _node$sortableInfo.index,
					    collection = _node$sortableInfo.collection;


					if (useDragHandle && !closest(e.target, function (el) {
						return el.sortableHandle != null;
					})) return;

					_this.manager.active = { index: index, collection: collection };

					if (!distance) {
						_this.pressTimer = setTimeout(function () {
							return _this.handlePress(e);
						}, _this.props.pressDelay);
					}
				}
			};

			_this.handleMove = function (e) {
				var distance = _this.props.distance;


				if (!_this.state.sorting && _this._touched) {
					_this._delta = {
						x: _this._pos.x - e.clientX,
						y: _this._pos.y - e.clientY
					};
					var delta = Math.abs(_this._delta.x) + Math.abs(_this._delta.y);

					if (!distance) {
						_this.cancel();
					} else if (delta >= distance) {
						_this.handlePress(e);
					}
				}
			};

			_this.handleEnd = function () {
				var distance = _this.props.distance;


				_this._touched = false;

				if (!distance) {
					_this.cancel();
				}
			};

			_this.cancel = function () {
				if (!_this.state.sorting) {
					clearTimeout(_this.pressTimer);
					_this.manager.active = null;
				}
			};

			_this.handlePress = function (e) {
				var active = _this.manager.getActive();

				if (active) {
					var _this$props2 = _this.props,
					    axis = _this$props2.axis,
					    onSortStart = _this$props2.onSortStart,
					    helperClass = _this$props2.helperClass,
					    hideSortableGhost = _this$props2.hideSortableGhost,
					    useWindowAsScrollContainer = _this$props2.useWindowAsScrollContainer;
					var node = active.node,
					    collection = active.collection;
					var index = node.sortableInfo.index;

					var margin = getElementMargin(node);

					var containerBoundingRect = _this.container.getBoundingClientRect();

					_this.node = node;
					_this.margin = margin;
					_this.width = node.offsetWidth;
					_this.height = node.offsetHeight;
					_this.dimension = axis === 'x' ? _this.width : _this.height;
					_this.marginOffset = {
						x: _this.margin.left + _this.margin.right,
						y: Math.max(_this.margin.top, _this.margin.bottom)
					};
					_this.boundingClientRect = node.getBoundingClientRect();
					_this.index = index;
					_this.newIndex = index;

					var edge = _this.edge = axis === 'x' ? 'Left' : 'Top';
					_this.offsetEdge = _this.getEdgeOffset(edge, node);
					_this.initialOffset = _this.getOffset(e);
					_this.initialScroll = _this.scrollContainer['scroll' + edge];

					_this.helper = _this.document.body.appendChild(node.cloneNode(true));
					_this.helper.style.position = 'fixed';
					_this.helper.style.top = _this.boundingClientRect.top - margin.top + 'px';
					_this.helper.style.left = _this.boundingClientRect.left - margin.left + 'px';
					_this.helper.style.width = _this.width + 'px';
					_this.helper.style.boxSizing = 'border-box';

					if (hideSortableGhost) {
						_this.sortableGhost = node;
						node.style.visibility = 'hidden';
					}

					if (axis === 'x') {
						_this.minTranslate = (useWindowAsScrollContainer ? 0 : containerBoundingRect.left) - _this.boundingClientRect.left - _this.width / 2;
						_this.maxTranslate = (useWindowAsScrollContainer ? _this.contentWindow.innerWidth : containerBoundingRect.left + containerBoundingRect.width) - _this.boundingClientRect.left - _this.width / 2;
					} else {
						_this.minTranslate = (useWindowAsScrollContainer ? 0 : containerBoundingRect.top) - _this.boundingClientRect.top - _this.height / 2;
						_this.maxTranslate = (useWindowAsScrollContainer ? _this.contentWindow.innerHeight : containerBoundingRect.top + containerBoundingRect.height) - _this.boundingClientRect.top - _this.height / 2;
					}

					if (helperClass) {
						var _this$helper$classLis;

						(_this$helper$classLis = _this.helper.classList).add.apply(_this$helper$classLis, _toConsumableArray(helperClass.split(' ')));
					}

					_this.listenerNode = e.touches ? node : _this.contentWindow;
					events.move.forEach(function (eventName) {
						return _this.listenerNode.addEventListener(eventName, _this.handleSortMove, false);
					});
					events.end.forEach(function (eventName) {
						return _this.listenerNode.addEventListener(eventName, _this.handleSortEnd, false);
					});

					_this.setState({
						sorting: true,
						sortingIndex: index
					});

					if (onSortStart) onSortStart({ node: node, index: index, collection: collection }, e);
				}
			};

			_this.handleSortMove = function (e) {
				var onSortMove = _this.props.onSortMove;

				e.preventDefault(); // Prevent scrolling on mobile

				_this.updatePosition(e);
				_this.animateNodes();
				_this.autoscroll();

				if (onSortMove) onSortMove(e);
			};

			_this.handleSortEnd = function (e) {
				var _this$props3 = _this.props,
				    hideSortableGhost = _this$props3.hideSortableGhost,
				    onSortEnd = _this$props3.onSortEnd;
				var collection = _this.manager.active.collection;

				// Remove the event listeners if the node is still in the DOM

				if (_this.listenerNode) {
					events.move.forEach(function (eventName) {
						return _this.listenerNode.removeEventListener(eventName, _this.handleSortMove);
					});
					events.end.forEach(function (eventName) {
						return _this.listenerNode.removeEventListener(eventName, _this.handleSortEnd);
					});
				}

				// Remove the helper from the DOM
				_this.helper.parentNode.removeChild(_this.helper);

				if (hideSortableGhost && _this.sortableGhost) {
					_this.sortableGhost.style.visibility = '';
				}

				var nodes = _this.manager.refs[collection];
				for (var i = 0, len = nodes.length; i < len; i++) {
					var node = nodes[i];
					var el = node.node;

					// Clear the cached offsetTop / offsetLeft value
					node.edgeOffset = null;

					// Remove the transforms / transitions
					el.style[vendorPrefix + 'Transform'] = '';
					el.style[vendorPrefix + 'TransitionDuration'] = '';
				}

				if (typeof onSortEnd === 'function') {
					onSortEnd({
						oldIndex: _this.index,
						newIndex: _this.newIndex,
						collection: collection
					}, e);
				}

				// Stop autoscroll
				clearInterval(_this.autoscrollInterval);
				_this.autoscrollInterval = null;

				// Update state
				_this.manager.active = null;

				_this.setState({
					sorting: false,
					sortingIndex: null
				});

				_this._touched = false;
			};

			_this.autoscroll = function () {
				var translate = _this.translate;
				var direction = 0;
				var speed = 1;
				var acceleration = 10;

				if (translate >= _this.maxTranslate - _this.dimension / 2) {
					direction = 1; // Scroll Down
					speed = acceleration * Math.abs((_this.maxTranslate - _this.dimension / 2 - translate) / _this.dimension);
				} else if (translate <= _this.minTranslate + _this.dimension / 2) {
					direction = -1; // Scroll Up
					speed = acceleration * Math.abs((translate - _this.dimension / 2 - _this.minTranslate) / _this.dimension);
				}

				if (_this.autoscrollInterval) {
					clearTimeout(_this.autoscrollInterval);
					_this.autoscrollInterval = null;
					_this.isAutoScrolling = false;
				}

				if (direction !== 0) {
					_this.autoscrollInterval = setInterval(function () {
						_this.isAutoScrolling = true;
						var offset = 1 * speed * direction;
						_this.scrollContainer['scroll' + _this.edge] += offset;
						_this.translate += offset;
						_this.animateNodes();
					}, 5);
				}
			};

			_this.manager = new Manager();
			_this.events = {
				start: _this.handleStart,
				move: _this.handleMove,
				end: _this.handleEnd
			};

			invariant(!(props.distance && props.pressDelay), 'Attempted to set both `pressDelay` and `distance` on SortableContainer, you may only use one or the other, not both at the same time.');

			_this.state = {};
			return _this;
		}

		_createClass(_class, [{
			key: 'getChildContext',
			value: function getChildContext() {
				return {
					manager: this.manager
				};
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				var _this2 = this;

				var _props = this.props,
				    contentWindow = _props.contentWindow,
				    getContainer = _props.getContainer,
				    useWindowAsScrollContainer = _props.useWindowAsScrollContainer;


				this.container = typeof getContainer === 'function' ? getContainer(this.getWrappedInstance()) : ReactDOM.findDOMNode(this);
				this.document = this.container.ownerDocument || document;
				this.scrollContainer = useWindowAsScrollContainer ? this.document.body : this.container;
				this.contentWindow = typeof contentWindow === 'function' ? contentWindow() : contentWindow;

				var _loop = function _loop(key) {
					events[key].forEach(function (eventName) {
						return _this2.container.addEventListener(eventName, _this2.events[key], false);
					});
				};

				for (var key in this.events) {
					_loop(key);
				}
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				var _this3 = this;

				var _loop2 = function _loop2(key) {
					events[key].forEach(function (eventName) {
						return _this3.container.removeEventListener(eventName, _this3.events[key]);
					});
				};

				for (var key in this.events) {
					_loop2(key);
				}
			}
		}, {
			key: 'getEdgeOffset',
			value: function getEdgeOffset(edge, node) {
				var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

				// Get the actual offsetTop / offsetLeft value, no matter how deep the node is nested
				if (node) {
					if (node.parentNode !== this.container) {
						return this.getEdgeOffset(edge, node.parentNode, offset + node['offset' + edge]);
					} else {
						return node['offset' + edge] + offset;
					}
				}
			}
		}, {
			key: 'getOffset',
			value: function getOffset(e) {
				return {
					x: e.touches ? e.touches[0].clientX : e.clientX,
					y: e.touches ? e.touches[0].clientY : e.clientY
				};
			}
		}, {
			key: 'getLockPixelOffsets',
			value: function getLockPixelOffsets() {
				var lockOffset = this.props.lockOffset;


				if (!Array.isArray(lockOffset)) {
					lockOffset = [lockOffset, lockOffset];
				}

				invariant(lockOffset.length === 2, 'lockOffset prop of SortableContainer should be a single ' + 'value or an array of exactly two values. Given %s', lockOffset);

				var _lockOffset = lockOffset,
				    _lockOffset2 = _slicedToArray(_lockOffset, 2),
				    minLockOffset = _lockOffset2[0],
				    maxLockOffset = _lockOffset2[1];

				return [this.getLockPixelOffset(minLockOffset), this.getLockPixelOffset(maxLockOffset)];
			}
		}, {
			key: 'getLockPixelOffset',
			value: function getLockPixelOffset(lockOffset) {
				var offset = lockOffset;
				var unit = 'px';

				if (typeof lockOffset === 'string') {
					var match = /^[+-]?\d*(?:\.\d*)?(px|%)$/.exec(lockOffset);

					invariant(match !== null, 'lockOffset value should be a number or a string of a ' + 'number followed by "px" or "%". Given %s', lockOffset);

					offset = parseFloat(lockOffset);
					unit = match[1];
				}

				invariant(isFinite(offset), 'lockOffset value should be a finite. Given %s', lockOffset);

				if (unit === '%') {
					offset = offset * this.dimension / 100;
				}

				return offset;
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition(e) {
				var _props2 = this.props,
				    axis = _props2.axis,
				    lockAxis = _props2.lockAxis,
				    lockToContainerEdges = _props2.lockToContainerEdges;

				var offset = this.getOffset(e);
				var translate = {
					x: offset.x - this.initialOffset.x,
					y: offset.y - this.initialOffset.y
				};

				this.translate = translate[axis];

				if (lockToContainerEdges) {
					var _getLockPixelOffsets = this.getLockPixelOffsets(),
					    _getLockPixelOffsets2 = _slicedToArray(_getLockPixelOffsets, 2),
					    minLockOffset = _getLockPixelOffsets2[0],
					    maxLockOffset = _getLockPixelOffsets2[1];

					var minOffset = this.dimension / 2 - minLockOffset;
					var maxOffset = this.dimension / 2 - maxLockOffset;

					translate[axis] = limit(this.minTranslate + minOffset, this.maxTranslate - maxOffset, translate[axis]);
				}

				switch (lockAxis) {
					case 'x':
						translate.y = 0;
						break;
					case 'y':
						translate.x = 0;
						break;
				}

				this.helper.style[vendorPrefix + 'Transform'] = 'translate3d(' + translate.x + 'px,' + translate.y + 'px, 0)';
			}
		}, {
			key: 'animateNodes',
			value: function animateNodes() {
				var _props3 = this.props,
				    axis = _props3.axis,
				    transitionDuration = _props3.transitionDuration,
				    hideSortableGhost = _props3.hideSortableGhost;

				var nodes = this.manager.getOrderedRefs();
				var deltaScroll = this.scrollContainer['scroll' + this.edge] - this.initialScroll;
				var sortingOffset = this.offsetEdge + this.translate + deltaScroll;
				this.newIndex = null;

				for (var i = 0, len = nodes.length; i < len; i++) {
					var _nodes$i = nodes[i],
					    node = _nodes$i.node,
					    edgeOffset = _nodes$i.edgeOffset;

					var index = node.sortableInfo.index;
					var dimension = axis === 'x' ? node.offsetWidth : node.offsetHeight;
					var offset = this.dimension > dimension ? dimension / 2 : this.dimension / 2;
					var translate = 0;
					var translateX = 0;
					var translateY = 0;

					// If we haven't cached the node's offsetTop / offsetLeft value
					if (edgeOffset == null) {
						nodes[i].edgeOffset = edgeOffset = this.getEdgeOffset(this.edge, node);
					}

					// If the node is the one we're currently animating, skip it
					if (index === this.index) {
						if (hideSortableGhost) {
							/*
        * With windowing libraries such as `react-virtualized`, the sortableGhost
        * node may change while scrolling down and then back up (or vice-versa),
        * so we need to update the reference to the new node just to be safe.
        */
							this.sortableGhost = node;
							node.style.visibility = 'hidden';
						}
						continue;
					}

					if (transitionDuration) {
						node.style[vendorPrefix + 'TransitionDuration'] = transitionDuration + 'ms';
					}

					if (index > this.index && sortingOffset + offset >= edgeOffset) {
						translate = -(this.dimension + this.marginOffset[axis]);
						this.newIndex = index;
					} else if (index < this.index && sortingOffset <= edgeOffset + offset) {
						translate = this.dimension + this.marginOffset[axis];

						if (this.newIndex == null) {
							this.newIndex = index;
						}
					}

					if (axis === 'x') {
						translateX = translate;
					} else {
						translateY = translate;
					}

					node.style[vendorPrefix + 'Transform'] = 'translate3d(' + translateX + 'px,' + translateY + 'px,0)';
				}

				if (this.newIndex == null) {
					this.newIndex = this.index;
				}
			}
		}, {
			key: 'getWrappedInstance',
			value: function getWrappedInstance() {
				invariant(config.withRef, 'To access the wrapped instance, you need to pass in {withRef: true} as the second argument of the SortableContainer() call');
				return this.refs.wrappedInstance;
			}
		}, {
			key: 'render',
			value: function render() {
				var ref = config.withRef ? 'wrappedInstance' : null;

				return React.createElement(WrappedComponent, _extends({ ref: ref }, this.props, this.state));
			}
		}]);

		return _class;
	}(Component), _class.displayName = WrappedComponent.displayName ? 'SortableList(' + WrappedComponent.displayName + ')' : 'SortableList', _class.WrappedComponent = WrappedComponent, _class.defaultProps = {
		axis: 'y',
		transitionDuration: 300,
		pressDelay: 0,
		distance: 0,
		useWindowAsScrollContainer: false,
		hideSortableGhost: true,
		contentWindow: typeof window !== 'undefined' ? window : null,
		shouldCancelStart: function shouldCancelStart(e) {
			// Cancel sorting if the event target is an `input`, `textarea`, `select` or `option`
			if (['input', 'textarea', 'select', 'option'].indexOf(e.target.tagName.toLowerCase()) !== -1) {
				return true; // Return true to cancel sorting
			}
		},
		lockToContainerEdges: false,
		lockOffset: '50%'
	}, _class.propTypes = {
		axis: PropTypes.oneOf(['x', 'y']),
		distance: PropTypes.number,
		lockAxis: PropTypes.string,
		helperClass: PropTypes.string,
		transitionDuration: PropTypes.number,
		contentWindow: PropTypes.any,
		onSortStart: PropTypes.func,
		onSortMove: PropTypes.func,
		onSortEnd: PropTypes.func,
		shouldCancelStart: PropTypes.func,
		pressDelay: PropTypes.number,
		useDragHandle: PropTypes.bool,
		useWindowAsScrollContainer: PropTypes.bool,
		hideSortableGhost: PropTypes.bool,
		lockToContainerEdges: PropTypes.bool,
		lockOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))]),
		getContainer: PropTypes.func
	}, _class.childContextTypes = {
		manager: PropTypes.object.isRequired
	}, _temp;
}