import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof FontAwesome5>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Original mappings
  'house.fill': 'home',
  'paperplane.fill': 'paper-plane',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'add.circle.fill': 'plus',
  'usergraduate': 'user-graduate',
  'map': 'map-marked-alt',
  'location.fill': 'map-marker-alt',
  'location.circle': 'map-marker-alt',
  
  // Tambahan untuk tab navigation
  'list.bullet': 'list',
  'bookmark': 'bookmark',
  'magnifyingglass': 'search',
  'person.fill': 'user',
  'mappin': 'map-pin',
  'mappin.circle.fill': 'map-marker-alt',
  'trash': 'trash-alt',
  'pencil': 'pencil-alt',
  'xmark.circle.fill': 'times-circle',
  'info.circle.fill': 'info-circle',
  'exclamationmark.triangle.fill': 'exclamation-triangle',
  'book.fill': 'book',
  'calendar': 'calendar-alt',
  'envelope.fill': 'envelope',
  'lock.fill': 'lock',
  'eye.fill': 'eye',
  'eye.slash.fill': 'eye-slash',
  'arrow.right': 'arrow-right',
  'rectangle.portrait.and.arrow.right': 'sign-out-alt',
  'line.3.horizontal.decrease.circle': 'filter',
  'xmark': 'times',
} as const;

/**
 * An icon component that uses native SF Symbols on iOS, and FontAwesome5 on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to FontAwesome5.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <FontAwesome5 color={color} size={size} name={MAPPING[name]} style={style} />;
}