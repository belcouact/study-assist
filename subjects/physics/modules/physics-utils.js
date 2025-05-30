/**
 * 物理工具函数模块
 * 提供通用的物理计算、数学工具和辅助函数
 */

// 物理常数库（扩展版）
const PhysicsConstants = {
    // 基本物理常数
    SPEED_OF_LIGHT: 299792458, // m/s
    PLANCK_CONSTANT: 6.62607015e-34, // J⋅s
    REDUCED_PLANCK: 1.054571817e-34, // ℏ = h/2π
    ELEMENTARY_CHARGE: 1.602176634e-19, // C
    ELECTRON_MASS: 9.1093837015e-31, // kg
    PROTON_MASS: 1.67262192369e-27, // kg
    NEUTRON_MASS: 1.67492749804e-27, // kg
    
    // 电磁学常数
    MAGNETIC_PERMEABILITY: 4 * Math.PI * 1e-7, // μ₀ H/m
    ELECTRIC_PERMITTIVITY: 8.854187817e-12, // ε₀ F/m
    COULOMB_CONSTANT: 8.9875517923e9, // k = 1/(4πε₀) N⋅m²/C²
    
    // 热力学常数
    BOLTZMANN_CONSTANT: 1.380649e-23, // k_B J/K
    AVOGADRO_CONSTANT: 6.02214076e23, // N_A mol⁻¹
    GAS_CONSTANT: 8.314462618, // R J/(mol⋅K)
    STEFAN_BOLTZMANN: 5.670374419e-8, // σ W/(m²⋅K⁴)
    
    // 原子物理常数
    FINE_STRUCTURE: 7.2973525693e-3, // α = e²/(4πε₀ℏc)
    RYDBERG_CONSTANT: 1.0973731568160e7, // R∞ m⁻¹
    BOHR_RADIUS: 5.29177210903e-11, // a₀ m
    
    // 引力常数
    GRAVITATIONAL_CONSTANT: 6.67430e-11, // G N⋅m²/kg²
    EARTH_GRAVITY: 9.80665, // g m/s²
    
    // 光学常数
    VACUUM_WAVELENGTH_SODIUM_D: 589.29e-9, // m
    REFRACTIVE_INDEX_AIR: 1.000293,
    REFRACTIVE_INDEX_WATER: 1.333,
    REFRACTIVE_INDEX_GLASS: 1.5
};

// 单位转换工具
const UnitConverter = {
    // 能量转换
    energy: {
        joulesToEv: (joules) => joules / PhysicsConstants.ELEMENTARY_CHARGE,
        evToJoules: (ev) => ev * PhysicsConstants.ELEMENTARY_CHARGE,
        joulesToKcal: (joules) => joules / 4184,
        kcalToJoules: (kcal) => kcal * 4184
    },
    
    // 温度转换
    temperature: {
        celsiusToKelvin: (celsius) => celsius + 273.15,
        kelvinToCelsius: (kelvin) => kelvin - 273.15,
        celsiusToFahrenheit: (celsius) => celsius * 9/5 + 32,
        fahrenheitToCelsius: (fahrenheit) => (fahrenheit - 32) * 5/9
    },
    
    // 压强转换
    pressure: {
        paToAtm: (pa) => pa / 101325,
        atmToPa: (atm) => atm * 101325,
        paToTorr: (pa) => pa * 0.00750062,
        torrToPa: (torr) => torr / 0.00750062
    },
    
    // 长度转换
    length: {
        mToNm: (meters) => meters * 1e9,
        nmToM: (nanometers) => nanometers / 1e9,
        mToAngstrom: (meters) => meters * 1e10,
        angstromToM: (angstroms) => angstroms / 1e10
    }
};

// 数学工具函数
const MathUtils = {
    // 向量运算
    vector: {
        add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
        subtract: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
        multiply: (v, scalar) => ({ x: v.x * scalar, y: v.y * scalar }),
        magnitude: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
        normalize: (v) => {
            const mag = MathUtils.vector.magnitude(v);
            return mag > 0 ? { x: v.x / mag, y: v.y / mag } : { x: 0, y: 0 };
        },
        dot: (v1, v2) => v1.x * v2.x + v1.y * v2.y,
        cross: (v1, v2) => v1.x * v2.y - v1.y * v2.x,
        angle: (v1, v2) => Math.acos(MathUtils.vector.dot(v1, v2) / 
            (MathUtils.vector.magnitude(v1) * MathUtils.vector.magnitude(v2)))
    },
    
    // 数值方法
    numerical: {
        // 数值积分（辛普森法则）
        simpson: (func, a, b, n = 1000) => {
            const h = (b - a) / n;
            let sum = func(a) + func(b);
            
            for (let i = 1; i < n; i++) {
                const x = a + i * h;
                sum += func(x) * (i % 2 === 0 ? 2 : 4);
            }
            
            return sum * h / 3;
        },
        
        // 数值微分
        derivative: (func, x, h = 1e-6) => {
            return (func(x + h) - func(x - h)) / (2 * h);
        },
        
        // 龙格-库塔法求解ODE
        rungeKutta4: (dydt, y0, x0, xf, n = 1000) => {
            const h = (xf - x0) / n;
            const result = [{ x: x0, y: y0 }];
            
            let x = x0;
            let y = y0;
            
            for (let i = 0; i < n; i++) {
                const k1 = h * dydt(x, y);
                const k2 = h * dydt(x + h/2, y + k1/2);
                const k3 = h * dydt(x + h/2, y + k2/2);
                const k4 = h * dydt(x + h, y + k3);
                
                y += (k1 + 2*k2 + 2*k3 + k4) / 6;
                x += h;
                
                result.push({ x, y });
            }
            
            return result;
        }
    },
    
    // 统计工具
    statistics: {
        mean: (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length,
        variance: (arr) => {
            const mean = MathUtils.statistics.mean(arr);
            return arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
        },
        standardDeviation: (arr) => Math.sqrt(MathUtils.statistics.variance(arr)),
        histogram: (data, bins) => {
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binWidth = (max - min) / bins;
            const hist = new Array(bins).fill(0);
            
            data.forEach(value => {
                const bin = Math.min(Math.floor((value - min) / binWidth), bins - 1);
                hist[bin]++;
            });
            
            return hist;
        }
    },
    
    // 特殊函数
    special: {
        // 贝塞尔函数J0的近似
        besselJ0: (x) => {
            if (Math.abs(x) < 8) {
                const y = x * x;
                return (76890.0 + y * (-18120.0 + y * (864.0 + y * (-10.0 + y)))) /
                       (76890.0 + y * (2850.0 + y * (37.0 + y)));
            } else {
                const z = 8 / x;
                const y = z * z;
                const xx = x - 0.785398164;
                const p0 = 1.0;
                const p1 = -0.1098628627e-2;
                const p2 = 0.2734510407e-4;
                const q0 = -0.1562499995e-1;
                const q1 = 0.1430488765e-3;
                const q2 = -0.6911147651e-5;
                
                return Math.sqrt(0.636619772 / x) * 
                       (Math.cos(xx) * (p0 + y * (p1 + y * p2)) - 
                        z * Math.sin(xx) * (q0 + y * (q1 + y * q2)));
            }
        },
        
        // 误差函数erf的近似
        erf: (x) => {
            const a1 =  0.254829592;
            const a2 = -0.284496736;
            const a3 =  1.421413741;
            const a4 = -1.453152027;
            const a5 =  1.061405429;
            const p  =  0.3275911;
            
            const sign = x >= 0 ? 1 : -1;
            x = Math.abs(x);
            
            const t = 1.0 / (1.0 + p * x);
            const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
            
            return sign * y;
        }
    }
};

// 物理计算工具
const PhysicsCalculator = {
    // 电磁学计算
    electromagnetic: {
        // 库仑力
        coulombForce: (q1, q2, r) => {
            return PhysicsConstants.COULOMB_CONSTANT * Math.abs(q1 * q2) / (r * r);
        },
        
        // 电场强度
        electricField: (q, r) => {
            return PhysicsConstants.COULOMB_CONSTANT * Math.abs(q) / (r * r);
        },
        
        // 电势
        electricPotential: (q, r) => {
            return PhysicsConstants.COULOMB_CONSTANT * q / r;
        },
        
        // 磁场（直导线）
        magneticFieldStraightWire: (current, r) => {
            return PhysicsConstants.MAGNETIC_PERMEABILITY * current / (2 * Math.PI * r);
        },
        
        // 电感（螺线管）
        solenoidInductance: (n, A, l) => {
            return PhysicsConstants.MAGNETIC_PERMEABILITY * n * n * A / l;
        },
        
        // 电容（平行板）
        plateCapacitor: (A, d, er = 1) => {
            return PhysicsConstants.ELECTRIC_PERMITTIVITY * er * A / d;
        }
    },
    
    // 波动光学计算
    waves: {
        // 波长-频率关系
        wavelengthFromFrequency: (freq, velocity = PhysicsConstants.SPEED_OF_LIGHT) => {
            return velocity / freq;
        },
        
        // 双缝干涉
        doubleSlit: (wavelength, slitSeparation, screenDistance, m) => {
            return m * wavelength * screenDistance / slitSeparation;
        },
        
        // 单缝衍射最小值位置
        singleSlitMinima: (wavelength, slitWidth, screenDistance, m) => {
            return m * wavelength * screenDistance / slitWidth;
        },
        
        // 布拉格衍射
        braggCondition: (n, d, theta) => {
            return n * 2 * d * Math.sin(theta);
        },
        
        // 多普勒效应
        dopplerShift: (f0, vs, vo, v = 343) => {
            return f0 * (v + vo) / (v + vs);
        }
    },
    
    // 热力学计算
    thermodynamics: {
        // 理想气体状态方程
        idealGasLaw: (n, R, T, V) => {
            if (V === undefined) return n * R * T; // 返回PV
            return n * R * T / V; // 返回P
        },
        
        // 麦克斯韦-玻尔兹曼分布
        maxwellBoltzmann: (v, m, T) => {
            const kB = PhysicsConstants.BOLTZMANN_CONSTANT;
            const factor = Math.sqrt(2 / Math.PI) * Math.pow(m / (kB * T), 3/2);
            return factor * v * v * Math.exp(-m * v * v / (2 * kB * T));
        },
        
        // 热传导
        heatConduction: (k, A, deltaT, deltaX) => {
            return k * A * deltaT / deltaX;
        },
        
        // 卡诺效率
        carnotEfficiency: (Th, Tc) => {
            return 1 - Tc / Th;
        },
        
        // 熵变
        entropyChange: (Qrev, T) => {
            return Qrev / T;
        }
    },
    
    // 量子力学计算
    quantum: {
        // 德布罗意波长
        deBroglieWavelength: (p) => {
            return PhysicsConstants.PLANCK_CONSTANT / p;
        },
        
        // 光子能量
        photonEnergy: (frequency) => {
            return PhysicsConstants.PLANCK_CONSTANT * frequency;
        },
        
        // 氢原子能级
        hydrogenEnergyLevel: (n) => {
            const Ry = 13.6; // eV
            return -Ry / (n * n);
        },
        
        // 隧道效应透射概率
        tunnelingProbability: (E, V0, a, m = PhysicsConstants.ELECTRON_MASS) => {
            const hbar = PhysicsConstants.REDUCED_PLANCK;
            const k = Math.sqrt(2 * m * (V0 - E)) / hbar;
            return Math.exp(-2 * k * a);
        }
    }
};

// 可视化辅助工具
const VisualizationUtils = {
    // 颜色工具
    color: {
        // HSL转RGB
        hslToRgb: (h, s, l) => {
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = l - c / 2;
            
            let r, g, b;
            if (h < 60) [r, g, b] = [c, x, 0];
            else if (h < 120) [r, g, b] = [x, c, 0];
            else if (h < 180) [r, g, b] = [0, c, x];
            else if (h < 240) [r, g, b] = [0, x, c];
            else if (h < 300) [r, g, b] = [x, 0, c];
            else [r, g, b] = [c, 0, x];
            
            return {
                r: Math.round((r + m) * 255),
                g: Math.round((g + m) * 255),
                b: Math.round((b + m) * 255)
            };
        },
        
        // 温度映射颜色
        temperatureToColor: (temp, minTemp = 200, maxTemp = 600) => {
            const normalized = (temp - minTemp) / (maxTemp - minTemp);
            const hue = (1 - normalized) * 240; // 240°(蓝) 到 0°(红)
            return VisualizationUtils.color.hslToRgb(hue, 1, 0.5);
        },
        
        // 速度映射颜色
        velocityToColor: (velocity, maxVelocity) => {
            const normalized = Math.min(velocity / maxVelocity, 1);
            const hue = normalized * 60; // 0°(红) 到 60°(黄)
            return VisualizationUtils.color.hslToRgb(hue, 1, 0.5);
        }
    },
    
    // 绘图工具
    drawing: {
        // 绘制网格
        drawGrid: (ctx, canvas, spacing = 20, color = '#f0f0f0') => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            
            for (let x = 0; x <= canvas.width; x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            for (let y = 0; y <= canvas.height; y += spacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        },
        
        // 绘制坐标轴
        drawAxes: (ctx, canvas, originX, originY, color = '#333') => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            
            // X轴
            ctx.beginPath();
            ctx.moveTo(0, originY);
            ctx.lineTo(canvas.width, originY);
            ctx.stroke();
            
            // Y轴
            ctx.beginPath();
            ctx.moveTo(originX, 0);
            ctx.lineTo(originX, canvas.height);
            ctx.stroke();
        },
        
        // 绘制比例尺
        drawScale: (ctx, x, y, length, realLength, unit, color = '#333') => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            
            // 比例尺线
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + length, y);
            ctx.stroke();
            
            // 端点
            ctx.beginPath();
            ctx.moveTo(x, y - 3);
            ctx.lineTo(x, y + 3);
            ctx.moveTo(x + length, y - 3);
            ctx.lineTo(x + length, y + 3);
            ctx.stroke();
            
            // 标签
            ctx.fillStyle = color;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${realLength} ${unit}`, x + length/2, y + 20);
        }
    },
    
    // 数据可视化
    plotting: {
        // 绘制函数图像
        plotFunction: (ctx, func, xMin, xMax, yMin, yMax, canvasWidth, canvasHeight) => {
            const xScale = canvasWidth / (xMax - xMin);
            const yScale = canvasHeight / (yMax - yMin);
            
            ctx.beginPath();
            let firstPoint = true;
            
            for (let px = 0; px <= canvasWidth; px++) {
                const x = xMin + px / xScale;
                const y = func(x);
                const py = canvasHeight - (y - yMin) * yScale;
                
                if (firstPoint) {
                    ctx.moveTo(px, py);
                    firstPoint = false;
                } else {
                    ctx.lineTo(px, py);
                }
            }
            
            ctx.stroke();
        },
        
        // 绘制散点图
        scatter: (ctx, points, xMin, xMax, yMin, yMax, canvasWidth, canvasHeight, pointSize = 3) => {
            const xScale = canvasWidth / (xMax - xMin);
            const yScale = canvasHeight / (yMax - yMin);
            
            points.forEach(point => {
                const px = (point.x - xMin) * xScale;
                const py = canvasHeight - (point.y - yMin) * yScale;
                
                ctx.beginPath();
                ctx.arc(px, py, pointSize, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    }
};

// 数据处理工具
const DataProcessor = {
    // 平滑数据
    smooth: (data, windowSize = 5) => {
        const smoothed = [];
        const halfWindow = Math.floor(windowSize / 2);
        
        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            let count = 0;
            
            for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
                sum += data[j];
                count++;
            }
            
            smoothed.push(sum / count);
        }
        
        return smoothed;
    },
    
    // 寻找峰值
    findPeaks: (data, threshold = 0.1) => {
        const peaks = [];
        const maxVal = Math.max(...data);
        const minThreshold = maxVal * threshold;
        
        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] > data[i-1] && data[i] > data[i+1] && data[i] > minThreshold) {
                peaks.push({ index: i, value: data[i] });
            }
        }
        
        return peaks;
    },
    
    // 快速傅里叶变换（简化版）
    fft: (signal) => {
        const N = signal.length;
        if (N <= 1) return signal;
        
        // 递归分治
        const even = [];
        const odd = [];
        
        for (let i = 0; i < N; i++) {
            if (i % 2 === 0) even.push(signal[i]);
            else odd.push(signal[i]);
        }
        
        const evenFFT = DataProcessor.fft(even);
        const oddFFT = DataProcessor.fft(odd);
        
        const result = new Array(N);
        
        for (let k = 0; k < N / 2; k++) {
            const t = { 
                real: Math.cos(-2 * Math.PI * k / N) * oddFFT[k].real - Math.sin(-2 * Math.PI * k / N) * (oddFFT[k].imag || 0),
                imag: Math.sin(-2 * Math.PI * k / N) * oddFFT[k].real + Math.cos(-2 * Math.PI * k / N) * (oddFFT[k].imag || 0)
            };
            
            result[k] = {
                real: evenFFT[k].real + t.real,
                imag: (evenFFT[k].imag || 0) + t.imag
            };
            
            result[k + N/2] = {
                real: evenFFT[k].real - t.real,
                imag: (evenFFT[k].imag || 0) - t.imag
            };
        }
        
        return result;
    }
};

// 将所有工具导出到全局变量
window.PhysicsConstants = PhysicsConstants;
window.UnitConverter = UnitConverter;
window.MathUtils = MathUtils;
window.PhysicsCalculator = PhysicsCalculator;
window.VisualizationUtils = VisualizationUtils;
window.DataProcessor = DataProcessor;

console.log('物理工具模块加载完成'); 